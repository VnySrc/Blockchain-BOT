import puppeteer from "puppeteer-extra"
import UserAgent from 'user-agents';
import path from 'path'
import _fs from 'fs'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import dotenv from "dotenv"
import axios from "axios"
dotenv.config()

puppeteer.use(StealthPlugin())

const extension_path = path.resolve("src/extensions/captcha")
const userAgent = new UserAgent()

export const runBot = async (account: any) => {
  try {

    const proxy = await axios.get("http://autocryptofarm.ddns.net:8000/api/next-proxy")
    const proxyData = proxy.data.proxy

    console.log(proxyData)
    console.log(proxyData)

  const browser = await puppeteer.launch({
    headless: false,
     args: [
    `--user-agent=${userAgent.toString()}`,
    `--proxy-server=${proxyData}`,
      '--start-minimized',
       '--disable-web-security',
       '--allow-file-access-from-files',
       '--allow-running-insecure-content',
      `--load-extension=${extension_path}`,
       `--disable-extensions-except=${extension_path}`,
       '--window-size=320,320',
       '--window-posizition=200,0',
      '--disable-infobars',
    //executablePath: chromium_path,
     ]
   })

   console.log("proxyData")

    const page = await browser.newPage()
   await page.goto("https://meuip.com.br/", {timeout: 30000})

   }catch (err) {
    console.log(err)
   }
}
runBot("sadsd")



//* import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
//* puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
