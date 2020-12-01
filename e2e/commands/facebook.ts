import type { Page, Browser } from 'puppeteer'
import type { SNS } from '../types/SNS'
import * as helpers from '../support/helpers'

class Facebook implements SNS {
    constructor(public id: string, public username: string, public password: string) {}

    name = 'facebook.com'

    // selectors
    composeButtonSelector = '#feedx_sprouts_container textarea'
    composeImageSelector = '#feedx_sprouts_container .fbScrollableArea img'
    composeEditorSelector = '#feedx_sprouts_container textarea, #feedx_sprouts_container [contenteditable="true"]'
    composeDialogEditorSelector = ''
    profileSelector = '#profile_timeline_intro_card'
    bioTextareaSelector = 'textarea[name="bio"]'
    commentInputSelector = '.userContentWrapper form.commentable_item form [contenteditable="true"]'

    setupGuideSelector = 'body > span'
    postDialogHintSelector = '#pagelet_composer [role="button"] + span'
    postDialogModalSelector = 'body > div:not([class]):not([style])'
    postAffixingCanvasSelector = '[data-testid="post_message"] + span'
    commentSelector =
        '.userContentWrapper form.commentable_item .accessible_elem ~ ul > li:first-child [data-ft] + span'
    commentBoxSelector = '.userContentWrapper form.commentable_item form ~ span:last-child'

    async getActivePage(browser: Browser) {
        const page = await helpers.getPageByUrl(browser, 'https://www.facebook.com/')
        if (page) {
            await helpers.setupPage(page)
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
            if ((await profileLink.evaluate((e) => e.getAttribute('href')))?.includes(this.id)) {
                return
            }

            // logout old account
            await this.logout(page)
        }

        // login with given account
        await page.goto('https://www.facebook.com/login', {
            waitUntil: 'load',
        })

        const nameInput = await page.waitForSelector('[name="email"]')
        const passwordInput = await page.waitForSelector('[name="pass"]')
        const submitButton = await page.waitForSelector('[name="login"]')
        // select preexist name
        await nameInput.click({ clickCount: 3 })
        await nameInput.type(this.username)
        await passwordInput.type(this.password)
        await submitButton.click()
        await page.waitForNavigation({
            waitUntil: 'load',
        })

        // wait for home
        await page.waitForSelector('[data-click="profile_icon"]')
    }

    async logout(page: Page) {
        // jump to logout dialog
        await page.goto('https://www.facebook.com', {
            waitUntil: 'load',
        })

        // click the nav link
        const navLink = await page.waitForSelector('#userNavigationLabel')
        await navLink.click()
        await page.waitForTimeout(500)

        // click logout button
        const logoutButton = await page.waitForSelector('.uiContextualLayer [role="menuitem"][data-gt*="menu_logout"]')
        await logoutButton.click()
        await page.waitForTimeout(500)

        // wait for login button
        await page.waitForSelector('#loginbutton')
    }

    async getBio(page: Page) {
        return ''
    }

    async setBio(page: Page, bio: string) {}

    async unsetBio(page: Page) {}

    async deletePost(page: Page) {}

    async dimissDialog(page: Page) {}
}

export default Facebook
