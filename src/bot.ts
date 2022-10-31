import puppeteer from "puppeteer-extra"
import UserAgent from 'user-agents';
import path from 'path'
import _fs from 'fs'
import { walletsTypes } from "./types/wallets"
import { login, openGamePage } from "./botServices";
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import dotenv from "dotenv"
import axios from "axios"
import { executablePath } from 'puppeteer'


dotenv.config()

puppeteer.use(StealthPlugin())

const extension_path = path.resolve("src/extensions/captcha")
const userAgent = new UserAgent()

let proxy: string
let rotation: 0

export const runBot = async (account: walletsTypes) => {
  try {

//* await getProxy()
//* console.log(proxy)

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
      '--disable-infobars',
     //* `--proxy-server=${proxy}`
     ],
     executablePath: executablePath()
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

async function getProxy () {
  if (rotation < 3 && proxy) {
    rotation++
    return
  }else {
    const response=  await axios.get(process.env.PROXY_URL as string)
    proxy =  response.data.proxy
    rotation = 0
  }
}



//* import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
//* puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
