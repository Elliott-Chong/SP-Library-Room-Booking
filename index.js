const puppeteer = require("puppeteer");
const bookings = require("./bookings.js");
const fs = require("fs").promises;
require("dotenv").config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LOG_FILE = "./bookings.log";

const getDayTabSelector = (date) => {
  let d = new Date(date);
  let month = d.getMonth() + 1;
  date = d.getDate();
  return "#" + "id" + date + month + "2022";
};

const getSlotValueSelector = (date, time, pod) => {
  // time is somethign like 15
  if (time < 9 || time > 19) return;
  // slotvalue="14:00 - 15:00"
  if (time <= 9) {
    time = "0" + parseInt(time);
  } else {
    time = parseInt(time);
  }
  let timeString = time + ":00" + " - " + (parseInt(time) + 1) + ":00";
  let d = new Date(date);
  let dd = d.getDate();
  let month = d.getMonth() + 1;
  let year = 2022;
  // 'Pod @ L1.3', '30/11/2022 12:00:00 AM','11:00 - 12:00');
  // 'Pod @ L1.2', '30/11/2022 12:00:00 AM','19:00 - 20:00');
  //   Pod @ L3A.5', '30/11/2022 12:00:00 AM','12:00 - 13:00'); "

  // pod is L1.3
  //   div[onkeypress*=\"'Pod @ L3A.5', '30/11/2022 12:00:00 AM','10:00 - 11:00'\"]
  // document.querySelector("div[onkeypress*=\"'Pod @ L3A.5', '30/11/2022 12:00:00 AM','10:00 - 11:00'\"]")
  return `document.querySelector(\"div[onclick*=\\"\'Pod @ ${pod}\', \'${dd}/${month}/2022 12:00:00 AM\',\'${timeString}\'\\"]\")?.click()`;
};

async function log(data) {
  await fs.appendFile(LOG_FILE, data);
}

async function test() {}

const config = process.argv.slice(2)[0];
if (config === "test") {
  test();
} else {
  main();
}

async function main() {
  let now = new Date().toString().split(" GMT")[0];
  await log("\n\nScript is starting to execute at " + now + "\n");
  await log("Username: " + process.env.sp_username + "\n");
  const browser = await puppeteer.launch({
    headless: false,
  });
  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    const { date, pod, slot } = booking;
    let page = await browser.newPage();
    await page.goto(
      "https://adfs.sp.edu.sg/adfs/ls?wa=wsignin1.0&wtrealm=urn%3aportal%3asp2016prod&wctx=https%3a%2f%2fapps2.sp.edu.sg%2fapps%2flrbs%2f_layouts%2f15%2fAuthenticate.aspx%3fSource%3d%252Fapps%252Flrbs%252FPages%252FHome%252Easpx&client-request-id=08ab5ab4-d4b8-4f47-ef12-0080010000f0&RedirectToIdentityProvider=AD+AUTHORITY"
    );
    if (i === 0) {
      await page.type("#userNameInput", process.env.sp_username);
      await page.type("#passwordInput", process.env.sp_password);
      await page.waitForSelector("#submitButton");
      await page.click("#submitButton");
    }

    page.on("error", function (err) {
      theTempValue = err.toString();
      console.log("Elliott Error: ");
    });
    page.on("pageerror", function (err) {
      console.log("Elliott Error: ");
    });
    console.log(getSlotValueSelector(date, slot, pod));
    try {
      await page.waitForSelector(getDayTabSelector(date));
      await sleep(800);
      await page.click(getDayTabSelector(date));
      await page.waitForNavigation();
      await page.screenshot({ path: "booking.png" });
      await sleep(1000);
      try {
        await page.evaluate(getSlotValueSelector(date, slot, pod));
        await sleep(1000);
        await page.waitForSelector("#submitPicks", { timeout: 2000 });
        await page.click("#submitPicks");
        await sleep(1000);
        await page.$eval('button[data-bb-handler="confirm"]', (button) =>
          button.click()
        );
        console.log(`Pod ${pod} has been booked on ${date} on slot ${slot}\n`);
        await log(`Pod ${pod} has been booked on ${date} on slot ${slot}\n`);
      } catch (error) {
        console.log(
          `Pod ${pod} on ${date} at slot ${slot} has already been booked :(\n`
        );
        await log(
          `Pod ${pod} on ${date} at slot ${slot} has already been booked :(\n`
        );
        continue;
      }
    } catch (e) {
      console.log(e);
      continue;
    }
  }
  await browser.close();
  let end = new Date().toString().split(" GMT")[0];
  await log("Script finished successfully at " + end + "\n\n");
  await log("-------------------------------------------------------------");
  console.log("Success!");
}
