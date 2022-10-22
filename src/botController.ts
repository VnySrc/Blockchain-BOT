import { runBot } from "./bot"
import { sleep } from "./botServices"
import { walletsTypes } from "./types/wallets"
import moment from "moment"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

let userToken: string ///!
let walletsList: walletsTypes[]

const config = {
    maxBrowsers: 1
}

let botActive = true
let accountsPool: any[] = []
let preparedAccounts: walletsTypes[] = []
let preparedAccountsNames: string[] = []

botSwitch(true)//!

async function botController () {
    if (!botActive) {
        await sleep(5)
        return
    }
 
    await getAccountsData()

    if (accountsPool.length < config.maxBrowsers) {
        preparedAccounts = walletsList.filter(wallet =>moment(wallet.nextminerequest) > moment() && !preparedAccountsNames.includes(wallet.name) || wallet.nextminerequest === null)
        preparedAccounts = preparedAccounts.sort((a, b) => moment(a.nextminerequest) > moment(b.nextminerequest) ? 1 : -1)

        for (const prepared of preparedAccounts) {
            if (accountsPool.length >= config.maxBrowsers) {
            break
            }   

            preparedAccountsNames.push(prepared.name)
            accountsPool.push(prepared)

            console.log("Rodando --- " + prepared.name)

            runBot(prepared).then((response:any) => {

                accountsPool = accountsPool.filter(e => e.id != prepared.id)
                preparedAccountsNames = preparedAccountsNames.filter(e => e != prepared.name)

                if (response instanceof Error) {
                    return
                }else {
                    let date = new Date()
                    console.log(date)
                    console.log(date)
                    let minutes =  response.nextminerequest // parseInt nextminerequest
                    date.setHours(date.getHours() - 4)
                    date.setMinutes(date.getMinutes() + minutes)
                    console.log(date)
                    console.log(date)
                    updateAccountsDataApi(prepared.id, {nextmine: response.nextmine * 60000, lastminetlm: response.mined, nextminerequest: date.toISOString()}) // transformar ms em minutos na data e data em formato iso // .replace(/\.\d{3}Z$/, '')
                }
            })
        }
    }
    setTimeout(botController, 20000)
}

async function botSwitch (value:boolean) {
    if (!value) {
        botActive = false
        return
    }else {
        await getCredntials() //!
        botActive = true
        botController()
    }
}


async function updateAccountsDataApi(id: any, data: any) {
    console.log(data)
   const response = await axios.put(`http://127.0.0.1:3331/wallets/${id}`, data,{
    headers: {
        Authorization: userToken
    }
   })

   console.log(response.data)

   return
 }



async function getCredntials() {
    try {
        const response = await axios.post("http://127.0.0.1:3331/login", {
            email: "teste@gmail.com",
            password: "17"
        })
        userToken = response.data.token 
        console.log(userToken)
        return
    }catch (err) {

    }
}

async function getAccountsData () {
    try {
        const response2 = await axios.get("http://127.0.0.1:3331/accountwallets", {
            headers: {
                Authorization: userToken //! process.env.USER_JWT_TOKEN
            }
        })
        walletsList = response2.data.wallets
        return
    }catch (err) {
        console.log(err)
    }
}








/*
function updateAccountsData(accountName: string, data: any) {
   let index = walletsList.findIndex(e => e.name === accountName)
   walletsList[index].nextMine = data.nextMine
   walletsList[index].lastMineTlm= data.lastMineTlm
   walletsList[index].nextminerequest = data.nextminerequest
}
*/