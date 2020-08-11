import type { Page } from 'puppeteer'

export const DASHBOARD_URL = 'chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html'

export async function open(page: Page) {
    await page.bringToFront()
    await page.goto(DASHBOARD_URL)
    await page.waitFor(500)
}

export async function openPersonas(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/personas?noredirect=true`)
    await page.waitFor(500)
}

export async function openWallets(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/wallets?noredirect=true`)
    await page.waitFor(500)
}

export async function openDebug(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/debug`)
    await page.waitFor(500)
}

export async function openSettings(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/settings?noredirect=true`)
    await page.waitFor(500)
}

export async function openSetupCreatePersona(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/setup/create-persona?noredirect=true`)
    await page.waitFor(500)
}

export async function openSetupRestoreDatabase(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/setup/restore-database?noredirect=true`)
    await page.waitFor(500)
}

export async function openSetupRestoreDatabaseAdvance(page: Page) {
    await page.bringToFront()
    await page.goto(`${DASHBOARD_URL}#/setup/restore-database-advance?noredirect=true`)
    await page.waitFor(500)
}

export async function reset(page: Page) {
    for await (const openPage of [openPersonas, openWallets]) {
        // open the page
        await openPage(page)

        // remove all items
        while (true) {
            const settingIcon = await page.$('[data-testid="setting_icon"]')

            if (settingIcon) {
                // click cog icon
                await settingIcon.click()
                await page.waitFor(500)

                // click the delete button
                const deleteButton = await page.waitFor('[data-testid="delete_button"]')
                await deleteButton.click()
                await page.waitFor(500)

                // click the confirm button
                const confirmButton = await page.waitFor('[data-testid="confirm_button"]')
                await confirmButton.click()
                await page.waitFor(500)
            } else {
                break
            }

            // waiting for personas list to be updated
            await page.waitFor(500)
        }
    }
}
