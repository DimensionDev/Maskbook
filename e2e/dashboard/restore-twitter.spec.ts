import { screenshot } from '../helpers'
import { DASHBOARD_URL } from '../constants'

describe('dashboard - setup twitter account', () => {
    beforeAll(async () => {
        await page.goto(DASHBOARD_URL)
    })

    it('setup twitter account', async () => {
        // #/initialize/start
        const setupButton = await page.waitFor('a[href="#/initialize/1s"]')
        expect(await setupButton.evaluate(e => e.textContent?.toLowerCase())).toBe('set up')
        await screenshot('initialize_start')
        await setupButton.click()

        // #/initialize/1s
        const nameInput = await page.waitFor('.MuiFormControl-root input[type=text]')
        const passwordInput = await page.waitFor('.MuiFormControl-root input[type=password]')
        const nextButton = await page.waitFor('.MuiButton-containedPrimary')
        expect(await nextButton.evaluate(e => e.textContent?.toLowerCase())).toBe('next')
        await nameInput.type('test')
        await passwordInput.type('12345678')
        await screenshot('initialize_1s')
    })
})
