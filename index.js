const puppeteer = require("puppeteer");
const bookings = require("./bookings.js");
// const fs = require("fs").promises;
require("dotenv").config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const date = "30 nov 2022";
const timeslot = 12;
const pod = "L3.2";

const getDayTabSelector = (date) => {
  d = new Date(date);
  let month = d.getMonth() + 1;
  date = d.getDate();
  return "#" + "id" + date + month + "2022";
};

const getSlotValueSelector = (time, pod) => {
  // time is somethign like 15
  if (time < 9 || time > 19) return;
  time = parseInt(time);
  // slotvalue="14:00 - 15:00"
  let timeString = time + ":00" + " - " + (time + 1) + ":00";
  let d = new Date(date);
  let dd = d.getDate();
  let month = d.getMonth() + 1;
  let year = 2022;
  // 'Pod @ L1.3', '30/11/2022 12:00:00 AM','11:00 - 12:00');
  // 'Pod @ L1.2', '30/11/2022 12:00:00 AM','19:00 - 20:00');
  //   Pod @ L3A.5', '30/11/2022 12:00:00 AM','12:00 - 13:00'); "

  // pod is L1.3
  //   div[onkeypress*=\"'Pod @ L3A.5', '30/11/2022 12:00:00 AM','10:00 - 11:00'\"]
  //   document.querySelector("div[onkeypress*=\"'Pod @ L3A.5', '30/11/2022 12:00:00 AM','10:00 - 11:00'\"]")
  return `document.querySelector(\"div[onkeypress*=\\"\'Pod @ ${pod}\', \'30/11/2022 12:00:00 AM\',\'${timeString}\'\\"]\").click()`;
  return `div[onkeypress*=\"\'Pod @ ${pod}\', \'${dd}/${month}/2022 12:00:00 AM\',${timeString}\"]`;
};

async function test() {
  console.log(getSlotValueSelector(12, "L3A.5"));
}

const config = process.argv.slice(2)[0];
if (config === "test") {
  test();
} else {
  main();
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  let page = await browser.newPage();
  await page.goto(
    "https://adfs.sp.edu.sg/adfs/ls?wa=wsignin1.0&wtrealm=urn%3aportal%3asp2016prod&wctx=https%3a%2f%2fapps2.sp.edu.sg%2fapps%2flrbs%2f_layouts%2f15%2fAuthenticate.aspx%3fSource%3d%252Fapps%252Flrbs%252FPages%252FHome%252Easpx&client-request-id=08ab5ab4-d4b8-4f47-ef12-0080010000f0&RedirectToIdentityProvider=AD+AUTHORITY"
  );
  await page.type("#userNameInput", process.env.sp_username);
  await page.type("#passwordInput", process.env.sp_password);
  await page.waitForSelector("#submitButton");
  await page.click("#submitButton");

  await page.screenshot({ path: "homepage.png" });
  //   await page.goto(
  //     "https://apps2.sp.edu.sg/apps/lrbs/pages/home.aspx?selectedDate=28/11/2022"
  //   );

  //   let ls = JSON.parse(await fs.readFile("./localStorage.json"));
  //   let cookies = JSON.parse(await fs.readFile("./cookies.json"));
  //   await page.setCookie(...cookies);
  //   await page.evaluate((ls) => {
  //     for (var key in ls) {
  //       localStorage.setItem(key, ls[key]);
  //     }
  //   }, ls);

  await page.waitForSelector(getDayTabSelector(date));
  await sleep(800);
  await page.click(getDayTabSelector(date));
  await page.waitForNavigation();
  //   await page.waitForSelector(getSlotValueSelector(timeslot, "L3A.5"));
  //   await sleep(800);
  //   await page.click(getSlotValueSelector(timeslot, "L3A.5"));
  await page.evaluate(getSlotValueSelector(timeslot, pod));
  await sleep(1000);
  await page.waitForSelector("#submitPicks");
  await page.click("#submitPicks");
  await sleep(1000);
  await page.$eval('button[data-bb-handler="confirm"]', (button) =>
    button.click()
  );
}
