import path from 'path'
import { Browser, Page } from "puppeteer"
import { walletsTypes } from "../types/wallets"



async function login (page: Page, account: walletsTypes) {
  try {
  // abrir a página do WAX
  await page.goto('https://all-access.wax.io/')
  // aguardar a renderização
  await sleep(7)

  let usuarioLogado = false

  try {
    await page.waitForSelector('#reddit-social-btn', { timeout: 3000 })
    usuarioLogado = false
  } catch (error) {
    // não encontrou o botão do Reddit assumit que o usuário está logado
    usuarioLogado = true
  }
  if (!usuarioLogado) {
    await page.waitForSelector('#reddit-social-btn')

   
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

    console.log("LOGOU!!!!!")

    //await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })

    //await saveCookieSession(page, account.user)
  }

    return Promise.resolve()
    
    }catch (err) {
      console.log(err)
    }
  }


  const openGamePage = async (page: Page, account: walletsTypes) => { // , mode, PAccount
    var result = {
        mined: 0,
        nextMine: "",
        nextMineRequest: 0
      }
    
      return new Promise(async (resolve) => {
    
        page.on('dialog', async dialog => {
          const message = dialog.message()
    
          if (message && message.includes('AW')) {
            // console.log(message);
    
            if (message == 'AW_STARTED') {
                console.log(message.replace('AW_MINE_DELAY:', ''))
            }
    
            if (message.includes('AW_MINE_DELAY')) {
              result.nextMine = message // e.replace('AW_MINE_DELAY:', '')
              console.log("MINE DELAY " + message.replace('AW_MINE_DELAY:', ''))
            }
    
            if (message.includes('AW_MINED')) {
              result.mined =  parseInt(message.replace('AW_MINED:', ''))
    
              return resolve(result)
            }
    
          if (message.includes('AW_MINE_DELAY_REQUEUE')) {
            result.nextMineRequest = parseInt(message.replace('AW_MINE_DELAY_REQUEUE:', ''))
            console.log("MINE DELAY REQUEUE " + message.replace('AW_MINE_DELAY:', ''))

            return resolve(result)
         }
          }
    
          await dialog.dismiss()
          return result
        })
    
        const mockedAlien = 'src/bot/alien_words/site/index.html'
        const pocket = `src/pages/pocket/Pocket_Aliens.html?ac=${account.name}`
    
        // ir para página do jogo
        await sleep(5)
        await page.goto(path.resolve(pocket))
        // await page.goto(path.join(remote.app.getAppPath(), `${process.env.NODE_ENV !== 'production' ? '' : './'}${pocket}`))
    })
  }
  




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