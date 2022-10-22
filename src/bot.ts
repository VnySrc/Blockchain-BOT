import puppeteer from "puppeteer-extra"
import UserAgent from 'user-agents';
import path from 'path'
import _fs from 'fs'
import { walletsTypes } from "./types/wallets"
import { login, openGamePage } from "./botServices";
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import dotenv from "dotenv"
dotenv.config()

puppeteer.use(StealthPlugin())

const extension_path = path.resolve("src/extensions/captcha")
const userAgent = new UserAgent()

export const runBot = async (account: walletsTypes) => {
  try {
  
  const browser = await puppeteer.launch({
    headless: process.env.WORK_MODE == "true" ? true : false,
     args: [
    '--user-agent='+userAgent.toString(),
      '--start-minimized',
       '--disable-web-security',
       '--allow-file-access-from-files',
      `--load-extension=${extension_path}`,
       `--disable-extensions-except=${extension_path}`,
       '--window-size=320,320',
       '--window-posizition=200,0',
      // '--disable-infobars',
    //executablePath: chromium_path,
     ]
   })

    const page = await browser.newPage()
    await login(page, account)
    let response = await openGamePage(page, account)
    await browser.close()
    return response

   }catch (err) {
    console.log(err)
   }
}




//* import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
//* puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
