import { Page, Browser } from 'puppeteer'
import { SNS } from '../types/SNS'
import { getPageByUrl, setupPage } from '../support/helpers'

class Facebook implements SNS {
    constructor(public id: string, public username: string, public password: string) {}

    name = 'facebook.com'

    // selectors
    composeButtonSelector = '#feedx_sprouts_container textarea'
    composeImageSelector = '#feedx_sprouts_container .fbScrollableArea img'
    composeEditorSelector = '#feedx_sprouts_container [contenteditable="true"]'
    profileSelector = '#profile_timeline_intro_card'
    bioTextareaSelector = 'textarea[name="bio"]'
    immersiveDialogSelector = 'body > span'
    postDialogHintSelector = '#pagelet_composer [role="button"] + span'
    postDialogModalSelector = 'body > div[aria-hidden="true"]:not([class]):not([style])'

    async getActivePage(browser: Browser) {
        const page = await getPageByUrl(browser, 'https://www.facebook.com/')
        if (page) {
            await setupPage(page)
        }
        return page
    }

    async openNewsFeed(page: Page) {
        await page.bringToFront()
        await page.goto('https://www.facebook.com/', {
            waitUntil: 'load',
        })
    }

    async login(page: Page) {
        // let auto redirect happens
        await page.goto('https://www.facebook.com/', {
            waitUntil: 'load',
        })

        const profileLink = await page.$('[data-click="profile_icon"] > a')

        // logined
        if (profileLink) {
            // user already login
            if ((await profileLink.evaluate(e => e.getAttribute('href')))?.includes(this.id)) {
                return
            }

            // logout old account
            await this.logout(page)
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
    }

    async logout(page: Page) {
        // jump to logout dialog
        await page.goto('https://www.facebook.com', {
            waitUntil: 'load',
        })

        // click the nav link
        const navLink = await page.waitFor('#userNavigationLabel')
        await navLink.click()
        await page.waitFor(500)

        // click logout button
        const logoutButton = await page.waitFor('.uiContextualLayer [role="menuitem"][data-gt*="menu_logout"]')
        await logoutButton.click()
        await page.waitFor(500)

        // wait for login button
        await page.waitFor('#loginbutton')
    }

    async getBio(page: Page) {
        return ''
    }

    async setBio(page: Page, bio: string) {}

    async unsetBio(page: Page) {}

    async deletePost(page: Page) {}
}

export default Facebook
