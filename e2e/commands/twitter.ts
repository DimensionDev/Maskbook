import { Page, ElementHandle, Browser } from 'puppeteer'
import { screenshot, updateInput, getPageByUrl, setupPage } from '../support/helpers'
import { SNS } from '../types/SNS'

class Twitter implements SNS {
    constructor(public id: string, public username: string, public password: string) {}

    name = 'twitter.com'

    // selectors
    composeButtonSelector = ''
    composeImageSelector = '[data-testid="primaryColumn"] [data-testid="attachments"] img'
    composeEditorSelector = '[data-testid="primaryColumn"] .DraftEditor-root [contenteditable="true"]'
    profileSelector = '[data-testid="primaryColumn"]'
    bioTextareaSelector = 'textarea[name="description"]'
    immersiveDialogSelector = 'body > script[nonce] ~ span'
    postDialogHintSelector = '[data-testid="primaryColumn"] [role="progressbar"] ~ span'
    postDialogModalSelector = 'body > script[nonce] ~ div[aria-hidden="true"]'

    async getActivePage(browser: Browser) {
        const page =
            (await getPageByUrl(browser, 'https://twitter.com/')) ||
            (await getPageByUrl(browser, 'https://twitter.com/home'))
        if (page) {
            await setupPage(page)
        }
        return page
    }

    async openNewsFeed(page: Page) {
        await page.bringToFront()
        await page.goto('https://twitter.com/home', {
            waitUntil: 'load',
        })
    }

    async openDisplay(page: Page) {
        await page.bringToFront()
        await page.goto('https://twitter.com/i/display', {
            waitUntil: 'load',
        })
    }

    async login(page: Page) {
        // let auto redirect happens
        await page.goto('https://twitter.com/settings/account', {
            waitUntil: 'load',
        })
        await page.waitFor(2000)

        // logined
        if ((await page.evaluate(() => location.href)).includes('/settings/account')) {
            const screenNameLink = await page.waitFor('[href="/settings/screen_name"]')

            // user already login
            if ((await screenNameLink.evaluate(e => e.textContent))?.includes(this.username)) {
                return
            }

            // logout old account
            await this.logout(page)
        }

        // login with given account
        await page.goto('https://twitter.com/login', {
            waitUntil: 'load',
        })

        const nameInput = await page.waitFor('[name="session[username_or_email]"]')
        const passwordInput = await page.waitFor('[name="session[password]"]')
        const submitButton = await page.waitFor('[data-testid="LoginForm_Login_Button"]')
        await nameInput.type(this.username)
        await passwordInput.type(this.password)
        await submitButton.click()
        await page.waitForNavigation({
            waitUntil: 'load',
        })

        // phone number challenge
        if (
            (await page.evaluate(() => location.href)).includes('account/login_challenge') &&
            process.env.E2E_ALICE_TWITTER_PHONE
        ) {
            const phoneInput = await page.waitFor('#challenge_response')
            const submitButton = await page.waitFor('[type="submit"]')

            await phoneInput.type(process.env.E2E_ALICE_TWITTER_PHONE)
            await submitButton.click()
            await page.waitFor(500)
        }

        // wait for home
        await page.waitFor('[aria-label="Profile"]')
    }

    async logout(page: Page) {
        // jump to logout dialog
        await page.goto('https://twitter.com/logout', {
            waitUntil: 'load',
        })

        const confirmButton = await page.waitFor('[data-testid="confirmationSheetConfirm"]')
        await confirmButton.click()
        await page.waitFor('[data-testid="signupButton"]')
    }

    async getBio(page: Page) {
        return ''
    }

    async setBio(page: Page, bio: string) {
        await page.bringToFront()
        await page.goto(`https://twitter.com/settings/profile`, {
            waitUntil: 'load',
        })

        const bioTextarea: ElementHandle<HTMLTextAreaElement> = await page.waitFor('textarea[name="description"]')
        await bioTextarea.evaluate(e => (e.value = bio))

        const saveButton = await page.waitFor('[data-testid="Profile_Save_Button"]')
        await updateInput(bioTextarea, bio)
        await saveButton.click()
        await page.waitFor('[href="/settings/profile"]') // confirm back to profile page
    }

    async unsetBio(page: Page) {
        return this.setBio(page, '')
    }

    async deletePost(page: Page, id: string) {
        await page.bringToFront()
        await page.goto(`https://twitter.com/${this.username}/status/${id}`, {
            waitUntil: 'load',
        })

        const caretButton = await page.waitFor('[data-testid="caret"]')
        await caretButton.click()

        const deleteButton = await page.waitFor('[role="menu"] [role="menuitem"]:first-child')
        await deleteButton.click()

        const confirmButton = await page.waitFor('[data-testid="confirmationSheetConfirm"]')
        await confirmButton.click()
        await page.waitFor('[href="/settings/profile"]') // confirm back to profile page
    }
}

export default Twitter
