const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const wait = require("util").promisify(setTimeout);
const {noms} = require('./names.js')
puppeteer.use(AdblockerPlugin());
puppeteer.use(StealthPlugin());


const TextElement = "TextInputWithLabel-input-element"
const confirmButton = "FormConfirmButtonV2-container FormConfirmButtonV2-container-desktop FormConfirmButtonV2-container-wide FormConfirmButtonV2-container-filled FormConfirmButtonV2-container-default FormConfirmButtonV2-container-size-md FormConfirmButtonV2-container-type-gilded ConfirmAndCancel-confirm-button"
const canButton = "CancelText-container CancelText-container-md ConfirmAndCancel-cancel-text-md ConfirmAndCancel-cancel-text-normal ConfirmAndCancel-cancel-text"
const signin = "FormConfirmButtonV2-container FormConfirmButtonV2-container-desktop FormConfirmButtonV2-container-hollow FormConfirmButtonV2-container-default FormConfirmButtonV2-container-size-md FormConfirmButtonV2-container-type-bleached LandingPageV3Header-sign-in"
const signup = "CancelText-container CancelText-container-md ConfirmAndCancel-cancel-text-md ConfirmAndCancel-cancel-text-normal ConfirmAndCancel-cancel-text";


function makeAccount() {
    ;(async () => {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            slowMo: 40
        });
        console.log("Browser opened.. Opening TempMail..")
        const tempMail = await browser.newPage();
        await tempMail.goto("https://temp-mail.org/", { waitUntil: 'networkidle2' })
        console.log("TempMail opened.. Going to Guilded..")
        const guilded = await browser.newPage();
        await guilded.goto("https://guilded.gg/", { waitUntil: 'networkidle2' })
        await wait(5000)
        console.log("Guilded opened.. Going to sign up..")
        try {
            await clickButton(signin, guilded)
            await wait(5000)
            await clickButton(signup, guilded)
            const email = await getEmail(tempMail)
            const username = `${noms[Math.floor(Math.random() * noms.length)]} |  ${Math.floor(Math.random() * 99999)}`
            const password = randomPassword(Math.floor(Math.random() * 8) + 8)
            const inputs = await guilded.$$(`input[class="${TextElement}"]`)
            await inputs[0].type(username)
            await inputs[1].type(email)
            await inputs[2].type(password)
            console.log("Account created.. Going to confirm..")
            await wait(2000)
            clickButton(confirmButton, guilded)
            console.log('Confirmed 1/5')
            await wait(5000)
            clickButton(confirmButton, guilded)
            console.log('Confirmed 2/5')
            await wait(5000)
            clickButton(canButton, guilded)
            console.log('Confirmed 3/5')
            await wait(5000)
            clickButton(confirmButton, guilded)
            console.log('Confirmed 4/5')
            await wait(5000)
            clickButton(confirmButton, guilded)
            console.log('Confirmed 5/5')
            await wait(5000)
            writeToFile(email, password)
            console.log(`${email}:${password} | Account created`)
            await browser.close()
            makeAccount()
        } catch (e) {
            console.log(e)
        }
    })()
    
}

async function getEmail(page) {
    await page.waitForSelector('#mail')
    let email = await page.$eval('#mail', el => el.value)
    if(email.includes("Loading")) {
        return getEmail(page)
    }
    return email
}

function randomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function clickButton(classname, page) {
    return page.evaluate(classname => {
        const button = document.getElementsByClassName(classname)[0]
        button.click()
    }, classname)
}

const fs = require('fs');   
function writeToFile(email, password) {
    fs.appendFileSync('accounts.txt', `${email}:${password}\n`)
}

makeAccount()