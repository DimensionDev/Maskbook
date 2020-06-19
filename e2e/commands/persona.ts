import { Page } from 'puppeteer'
import { DASHBOARD_URL } from '../support/constants'

export async function create(page: Page, username: string, password: string) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/initialize/start`)

    const setupButton = await page.waitFor('a[href="#/initialize/1s"]')
    await setupButton.click()

    const nameInput = await page.waitFor('.MuiFormControl-root input[type=text]')
    const passwordInput = await page.waitFor('.MuiFormControl-root input[type=password]')
    const nextButton = await page.waitFor('.MuiButton-containedPrimary')
    await nameInput.type(username)
    await passwordInput.type(password)
    await nextButton.click()

    const account = await page.waitFor('.MuiCardContent-root .MuiTypography-h5')
    expect(await account.evaluate(e => e.textContent)).toBe(username)

    const [_, matchedQuery] = page.url().match(/\?(.+)$/) ?? []
    return new URLSearchParams(matchedQuery).get('identifier')
}
