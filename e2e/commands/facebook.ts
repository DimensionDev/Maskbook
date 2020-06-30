import { Page, Browser } from 'puppeteer'
import { SNS } from '../types/SNS'
import { getPageByUrl } from '../support/helpers'

class Facebook implements SNS {
    constructor(public id: string, public username: string, public password: string) {}

    name = 'facebook.com'

    // selectors
    profileSelector = '#profile_timeline_intro_card'
    bioTextareaSelector = 'textarea[name="bio"]'
    immersiveDialogSelector = 'body > span'

    getActivePage(browser: Browser) {
        return getPageByUrl(browser, 'https://www.facebook.com/')
    }

    async openHome() {}
    async openProfile() {}

    async login(browser: Browser) {
        const page = await browser.newPage()

        // set a modern viewport
        await page.setViewport({ width: 1366, height: 768 })

        // let auto redirect happens
        await page.goto('https://www.facebook.com/', {
            // why networkidle2 ?
            // https://github.com/puppeteer/puppeteer/issues/4863#issuecomment-536419476
            waitUntil: 'networkidle2',
        })

        const profileLink = await page.$('[data-click="profile_icon"] > a')

        // logined
        if (profileLink) {
            // user already login
            if ((await profileLink.evaluate(e => e.getAttribute('href')))?.includes(this.id)) {
                await page.close()
                return
            }

            // logout old account
            await this.logout(browser)
        }

        // login with given account
        await page.goto('https://www.facebook.com/login', {
            waitUntil: 'load',
        })

        const nameInput = await page.waitFor('[name="email"]')
        const passwordInput = await page.waitFor('[name="pass"]')
        const submitButton = await page.waitFor('[name="login"]')
        await nameInput.type(this.username)
        await passwordInput.type(this.password)
        await submitButton.click()
        await page.waitForNavigation({
            waitUntil: 'load',
        })

        // wait for home
        await page.waitFor('[data-click="profile_icon"]')
        await page.close()
    }

    async logout(browser: Browser) {
        const page = await browser.newPage()

        // set a modern viewport
        await page.setViewport({ width: 1366, height: 768 })

        // jump to logout dialog
        await page.goto('https://www.facebook.com/log.out#', {
            waitUntil: 'load',
        })

        await page.waitFor('#loginbutton')
        await page.close()
    }

    async loginIfNeeded(page: Page, username: string, password: string) {}

    async logoutIfNeeded(page: Page, username: string, password: string) {}

    async getBio(page: Page) {
        return ''
    }

    async setBio(page: Page, bio: string) {}

    async unsetBio(page: Page) {}

    async deletePost(page: Page) {}
}

export default Facebook
