#!/usr/bin/env node


import { runBot } from "./src/bot"
import { sleep } from "./src/botServices"
import { walletsTypes } from "./src/types/wallets"
import moment from "moment"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()
    
var userToken: string ///!
var walletsList: [walletsTypes[], walletsTypes[]]

var botActive = true
var accountsPool: any[] = []
var preparedAccounts: walletsTypes[] = []
var preparedAccountsNames: string[] = []

console.log()

process.env.USER_TOKEN = `Bearer ${process.argv[2] ? process.argv[2] : process.env.USER_TOKEN}`
process.env.WORK_MODE = process.argv[3] ? process.argv[3] : process.env.WORK_MODE
process.env.MAX_BROWSERS = process.argv[4] ? process.argv[4] : process.env.MAX_BROWSERS
process.env.DELAY_QUANTITY = process.argv[5] ? process.argv[5] : process.env.DELAY_QUANTITY

console.log(
    process.env.USER_TOKEN,
    process.env.WORK_MODE,
    process.env.MAX_BROWSERS,
    process.env.DELAY_QUANTITY,
)

botSwitch(true)//!

async function botController () {
    if (!botActive) {
        await sleep(5)
        return
    }

    await getAccountsData()
 
    let maxBrowsers: number = parseInt(process.env.MAX_BROWSERS as string)
    let hourNow = await getHourNow()
    let walletsListToUse: walletsTypes[]

    if (typeof hourNow !== "number") {
        hourNow = parseInt(hourNow)
    }

    if (hourNow <= 12) {
        walletsListToUse = walletsList[0]
    }else {
        walletsListToUse = walletsList[1]
    }

    if (accountsPool.length < maxBrowsers) {
        preparedAccounts = walletsListToUse.filter(wallet =>moment(wallet.nextminerequest) < moment() && !preparedAccountsNames.includes(wallet.name) && wallet.cpu < 95 || wallet.nextminerequest === null && wallet.cpu < 95)
        preparedAccounts = preparedAccounts.sort((a, b) => moment(a.nextminerequest) < moment(b.nextminerequest) ? 1 : -1)

        for (const prepared of preparedAccounts) {
            if (accountsPool.length >= maxBrowsers) {
            break
            }   

            preparedAccountsNames.push(prepared.name)
            accountsPool.push(prepared)

            console.log(`Rodando conta --- ${prepared.name}`)

            
            runBot(prepared).then((response:any) => {

                accountsPool = accountsPool.filter(e => e.id != prepared.id)
                preparedAccountsNames = preparedAccountsNames.filter(e => e != prepared.name)

                if (response instanceof Error) {
                    return
                }else {
                    let date = new Date()
                    let minutes =  response.nextminerequest // parseInt nextminerequest
                    // date.setHours(date.getHours() - 3)
                    date.setMinutes(date.getMinutes() + minutes)
                    updateAccountsDataApi(prepared.id, {nextmine: response.nextmine * 60000, lastminetlm: response.mined, nextminerequest: date.toISOString()}) // transformar ms em minutos na data e data em formato iso // .replace(/\.\d{3}Z$/, '')
                }
            })
        }
    }
    setTimeout(botController, 3000)
}

async function botSwitch (value:boolean) {
    if (!value) {
        botActive = false
        return
    }else {
       //* await getCredntials() //!
       //* await getAccountsData()
        botActive = true
        botController()
    }
}

async function updateAccountsDataApi(id: any, data: any) {
    console.log(data)
   const response = await axios.put(`${process.env.API_URL as string}/wallets/${id}`, data,{
    headers: {
        Authorization:  process.env.USER_TOKEN as string //*userToken //! process.env.USER_JWT_TOKEN
    }
   })

   console.log(response.data)

   return
 }

async function getAccountsData () {
    try {
        const response2 = await axios.get(`${process.env.API_URL as string}/accountwallets` , {
            headers: {
                Authorization:  process.env.USER_TOKEN as string //*userToken //! process.env.USER_JWT_TOKEN
            }
        })
        const list1: walletsTypes[] = response2.data.wallets.slice(0, response2.data.wallets.length / 2)
        const list2: walletsTypes[]= response2.data.wallets.slice(response2.data.wallets.length / 2)

        walletsList = [list1, list2]
        return
    }catch (err) {
        console.log(err)
    }
}

async function getHourNow () {
    const response = await axios.get("http://worldtimeapi.org/api/timezone/America/Sao_Paulo")
    return response.data.datetime.split("T")[1].split(":")[0]
}

// async function getCredntials() {
//     try {
//         const response = await axios.post(process.env.API_URL as string, {
//             email: "teste@gmail.com",
//             password: "111"
//         })
//         userToken = response.data.token 
//         console.log(userToken)
//         return
//     }catch (err) {
//         console.log(err)
//     }
// }