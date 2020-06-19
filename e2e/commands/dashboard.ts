import { Page } from 'puppeteer'

export const DASHBOARD_URL = 'chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html'

export async function open(page: Page) {
    await page.bringToFront()
    await page.goto(DASHBOARD_URL)
    await page.waitFor(500)
}

export async function openHome(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/home/`)
    await page.waitFor(500)
}

export async function openHomeNoRedirect(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/home/?no_redirect`)
    await page.waitFor(500)
}

export async function openInitializeStart(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/initialize/start`)
    await page.waitFor(500)
}

export async function openInitializeNew(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/initialize/1s`)
    await page.waitFor(500)
}

export async function openInitializeRestore(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/initialize/1r`)
    await page.waitFor(500)
}

export async function openInitializePersona(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/initialize/1ra/persona/import`)
    await page.waitFor(500)
}

export async function reset(page: Page) {
    await openHomeNoRedirect(page)

    // remove all personas
    while (true) {
        const settingIcon = await page.$('[data-testid="initialization_persona_setting_icon"]')

        if (settingIcon) {
            await settingIcon.click()
            await page.waitFor(500)

            const deleteButton = await page.waitFor('[data-testid="initialization_persona_delete_button"]')
            await deleteButton.click()
            await page.waitFor(500)

            const confirmButton = await page.waitFor('[data-testid="initialization_dialog_confirm_button"]')
            await confirmButton.click()
            await page.waitFor(500)
        } else {
            break
        }
    }

    // remove all wallets
    // TODO
}
