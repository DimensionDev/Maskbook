import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import Twitter from '../../commands/twitter'
import Facebook from '../../commands/facebook'
import { SETUP_STORY_URL } from '../../support/constants'
import * as helpers from '../../support/helpers'

beforeEach(async () => {
    // setup page
    await helpers.setupPage(page)

    // restore alice's db backup
    await dashboard.openSetupRestoreDatabase(page)

    // restore an unconnected persona
    await restore.fromFile(page, join(__dirname, '../../fixtures/setup/db_backup_1_persona_0_profile.json'))
})

afterEach(async () => {
    // reset dashboard
    await dashboard.reset(page)
})

describe(`${SETUP_STORY_URL}-Workflow2:ConnectProfile`, () => {
    for (const sns of [
        new Twitter(
            process.env.E2E_ALICE_TWITTER_ID!,
            process.env.E2E_ALICE_TWITTER_USERNAME!,
            process.env.E2E_ALICE_TWITTER_PASSWORD!,
        ),
        new Facebook(
            process.env.E2E_ALICE_FACEBOOK_ID!,
            process.env.E2E_ALICE_FACEBOOK_USERNAME!,
            process.env.E2E_ALICE_FACEBOOK_PASSWORD!,
        ),
    ]) {
        // specifiy network
        if (process.env.E2E_NETWORK_ID && process.env.E2E_NETWORK_ID !== sns.name) {
            test.skip(sns.name, () => {})
            continue
        }

        it(sns.name, async () => {
            // login sns account
            const loginPage = await helpers.newPage(page)
            await sns.login(loginPage)
            await loginPage.close()

            // open dashbaord
            await dashboard.openPersonas(page)

            // click the connect button
            const connectButton = await page.waitFor(`[data-testid="connect_button_${sns.name}"]`)
            await connectButton.click()
            await page.waitFor(500)

            // continue with the opened sns home page
            const snsPage = await sns.getActivePage(page.browser())

            // sns home page is not opened
            if (!snsPage) throw new Error(`fail to find ${sns.name} home page`)

            // dimiss dialogs
            await sns.dimissDialog(snsPage)

            // wait maskbook inject setup guide
            await snsPage.waitFor(sns.setupGuideSelector)

            // validate username
            const usernameInput = await snsPage.waitForFunction(
                `document.querySelector('${sns.setupGuideSelector}').shadowRoot.querySelector('[data-testid="username_input"]')`,
            )
            expect(await usernameInput.asElement()?.evaluate((e) => (e as any).value)).toBe(sns.id)

            // take screenshot
            await helpers.screenshot(snsPage, `${sns.name}_connect_1`)

            // click the 'confirm' button
            const confirmButton = await snsPage.waitForFunction(
                `document.querySelector('${sns.setupGuideSelector}').shadowRoot.querySelector('[data-testid="confirm_button"]')`,
            )
            await (confirmButton as any).click()
            await page.waitFor(500)

            // click the 'done' button
            await (confirmButton as any).click()
            await page.waitFor(500)

            // redirect to news feed page
            await snsPage.waitFor(sns.composeEditorSelector)

            // wait maskbook inject setup guide
            await snsPage.waitFor(sns.setupGuideSelector)

            // click the 'create' button
            const createButton = await snsPage.waitForFunction(
                `document.querySelector('${sns.setupGuideSelector}').shadowRoot.querySelector('[data-testid="create_button"]')`,
            )
            await (createButton as any).click()
            await snsPage.waitFor(500)

            // wait for maskbook inject post dialog modal
            await snsPage.waitFor(sns.postDialogModalSelector)

            // validate content of the compose dialog
            const textTextarea = await snsPage.waitForFunction(
                `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="text_textarea"]')`,
            )
            const textContent = textTextarea.asElement()?.evaluate((e) => e.textContent)
            expect(textContent).toBeTruthy()

            // take screenshot
            await helpers.screenshot(snsPage, `${sns.name}_connect_2`)

            // wait for UI update
            await snsPage.waitFor(500)

            // click the 'done' button
            await (createButton as any).click()
            await snsPage.waitFor(500)

            // take screenshot
            await helpers.screenshot(snsPage, `${sns.name}_connect_3`)

            // close the page
            await snsPage.close()
        })
    }
})
