const puppeteer = require("puppeteer");
const fs = require("fs").promises;
require("dotenv").config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getSlotValueSelector = (time) => {
  // time is somethign like 15
  if (time < 9 || time > 19) return;
  time = parseInt(time);
  // slotvalue="14:00 - 15:00"
  return time + ":00" + " - " + (time + 1) + ":00";
};

async function test() {
  console.log(formatDateIntoTabSelectorId("24 nov 2022"));
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
  const page = await browser.newPage();
  await page.goto(
    "https://adfs.sp.edu.sg/adfs/ls?wa=wsignin1.0&wtrealm=urn%3aportal%3asp2016prod&wctx=https%3a%2f%2fapps2.sp.edu.sg%2fapps%2flrbs%2f_layouts%2f15%2fAuthenticate.aspx%3fSource%3d%252Fapps%252Flrbs%252FPages%252FHome%252Easpx&client-request-id=08ab5ab4-d4b8-4f47-ef12-0080010000f0&RedirectToIdentityProvider=AD+AUTHORITY"
  );
  await page.screenshot({ path: "homepage.png" });
  //   await page.goto(
  //     "https://apps2.sp.edu.sg/apps/lrbs/pages/home.aspx?selectedDate=28/11/2022"
  //   );

  await page.type("#userNameInput", process.env.sp_username);
  await page.type("#passwordInput", process.env.sp_password);
  await page.waitForSelector("#submitButton");
  await page.click("#submitButton");
  //   let ls = JSON.parse(await fs.readFile("./localStorage.json"));
  //   let cookies = JSON.parse(await fs.readFile("./cookies.json"));
  //   await page.setCookie(...cookies);
  //   await page.evaluate((ls) => {
  //     for (var key in ls) {
  //       localStorage.setItem(key, ls[key]);
  //     }
  //   }, ls);
  //   let slotSelector = getSlotValueSelector(14);
  //   await page.waitForSelector(`div[slotvalue="${slotSelector}"]`);
  //   console.log("hi");
  //   await page.click(`div[slotvalue="${slotSelector}"]`);
}
