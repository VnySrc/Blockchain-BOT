import path from 'path'
import { Browser, Page } from "puppeteer"
import { walletsTypes } from "./types/wallets"

async function login (page: Page, account: walletsTypes) {
  try {
 // abrir a página do WAX
 await page.goto('https://all-access.wax.io/')
 // aguardar a renderização
 await sleep(7)

 let usuarioLogado = false

 try {
   await page.waitForSelector('#reddit-social-btn', { timeout: 5000 })
   usuarioLogado = false
 } catch (error) {
   // não encontrou o botão do Reddit assumit que o usuário está logado
   usuarioLogado = true
 }
 if (!usuarioLogado) {

  await page.evaluate(`(async () => {
     document.querySelector('#reddit-social-btn').click();
   })()`)

   await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })

   await page.evaluate(`(async () => {
     document.querySelector('#loginUsername').value = '${account.user}';
     document.querySelector('#loginPassword').value = '${account.password}';
     document.querySelector('body > div > main > div.OnboardingStep.Onboarding__step.mode-auth > div > div.Step__content > form > fieldset:nth-child(8) > button').click();
   })()`)

   await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })

   await page.waitForSelector('body > div.content > div > div.access > form > div > input.fancybutton.newbutton.allow')
   await page.evaluate(`(async () => {
     document.querySelector('body > div.content > div > div.access > form > div > input.fancybutton.newbutton.allow').click();
   })()`)

   //await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })

   //await saveCookieSession(page, account.user)
 }

 return Promise.resolve()
  }catch (err) {
    console.log(err)
  }
   
  }


  const openGamePage = async (page: Page, account: walletsTypes) => { // , mode, PAccount
    let result = {
      mined: 0,
      nextmine: 0,
      nextminerequest: 0
    }

    try {
      await sleep(2)

      await page.goto("https://play.alienworlds.io/")

      await sleep(5)

      await page.waitForSelector('#root > div.css-8mefo3 > div > div.css-yfg7h4 > button', { timeout: 5000 }) // login
      await page.evaluate(`(async () => {
        document.querySelector('#root > div.css-8mefo3 > div > div.css-yfg7h4 > button').click();
      })()`)

      await sleep(5) // mine
      try {
        await page.waitForSelector('#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > button', { timeout: 15000 })
        await page.evaluate(`(async () => {
          document.querySelector('#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > button').click();
        })()`)
      }catch (err) { // caso  naoe steja no tempo do mine ainda
        await page.waitForSelector('#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > p.chakra-text.css-ov2nki > span:nth-child(2)', { timeout: 150000 })
          const minutes = await page.evaluate(() => {
          const result = document.querySelector("#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > p.chakra-text.css-ov2nki > span:nth-child(2)")?.innerHTML as string
          return result
        })
        result.nextmine = parseInt(minutes) + 1
        result.nextminerequest = parseInt(minutes) + 1
        return result
      }
     
      
      await sleep(15) // claim
      await page.waitForSelector('#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > button', { timeout: 55000 })
      await page.evaluate(`(async () => {
        document.querySelector('#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > button').click();
      })()`)

        await page.waitForSelector('#root > div:nth-child(2) > div > div > div.go318386747', { timeout: 55000 })
        const mined = await page.evaluate(() => {
          const result = document.querySelector("#root > div:nth-child(2) > div > div > div.go318386747")?.innerHTML.split(" ")[1] as string
          return result
        })
        await sleep(2)
        await page.waitForSelector('#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > p.chakra-text.css-ov2nki > span:nth-child(2)', { timeout: 55000 })
        const minutes = await page.evaluate(() => {
          const result = document.querySelector("#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > p.chakra-text.css-ov2nki > span:nth-child(2)")?.innerHTML as string
          return result
        })

      result.mined = parseFloat(mined)
      result.nextmine = parseInt(minutes)
      result.nextminerequest = parseInt(minutes)
    }catch (err) {
      console.log(err)
    }
      return result
  }
  
  // result.nextMine = document.querySelector("#root > div.css-r4izcz > div.css-xq9dq3 > div > div.css-1434km6 > div:nth-child(4) > div > div.css-2s09f0 > p.chakra-text.css-ov2nki > span:nth-child(2)").innerHtml
  //result.nextMineRequest = document.querySelector("s")




  async function sleep (sec: number) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(function () {
        resolve()
      }, sec * 1000)
    })
  }
  const timeoutReject = async (amount: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return reject('TIMEOUT')
      }, amount)
    })
  }



  export {login, openGamePage, sleep}