import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import Twitter from '../../commands/twitter'
import Facebook from '../../commands/facebook'
import { INITIALIZATION_STORY_URL } from '../../support/constants'
import { screenshot } from '../../support/helpers'
import { ElementHandle } from 'puppeteer'

beforeAll(async () => {
    // wait for default option page to be opened
    await page.waitFor(500)

    // set a modern viewport
    await page.setViewport({ width: 1366, height: 768 })

    // restore alice's db backup
    await dashboard.openInitializeRestore(page)
    await restore.fromFile(page, '../fixtures/initialization/db_backup_1_persona_0_profile.json')
})

afterAll(async () => {
    await dashboard.reset(page)
})

describe(`${INITIALIZATION_STORY_URL}-Workflow2:ConnectProfile`, () => {
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
        it(sns.name, async () => {
            // login sns account
            await sns.login(page.browser())

            // open dashbaord
            await dashboard.openHome(page)

            // click the connect button
            const connectButton = await page.waitFor(`[data-testid="connect_button_${sns.name}"]`)
            await connectButton.click()
            await page.waitFor(500)

            // continue with the opened sns home page
            const snsPage = await sns.getActivePage(page.browser())

            // sns home page is not opened
            if (!snsPage) {
                throw new Error(`fail to find ${sns.name} home page`)
            }

            // set a modern viewport
            await snsPage.setViewport({ width: 1366, height: 768 })

            // wait maskbook inject immersive dialog
            await snsPage.waitFor(sns.immersiveDialogSelector)

            // validate username
            await snsPage.waitFor(500)
            const idInput = await snsPage.evaluateHandle(
                `document.querySelector('${sns.immersiveDialogSelector}').shadowRoot.querySelector('[data-testid="id_input"]')`,
            )
            expect(await idInput.asElement()?.evaluate((e) => (e as any).value)).toBe(sns.id)

            // click the 'confirm' button
            await snsPage.waitFor(500)
            const confirmButton = await snsPage.evaluateHandle(
                `document.querySelector('${sns.immersiveDialogSelector}').shadowRoot.querySelector('[data-testid="confirm_button"]')`,
            )
            await (confirmButton as any).click()

            // redirect to profile page
            await snsPage.waitFor(sns.profileSelector)

            // wait maskbook inject dialog
            await snsPage.waitFor(sns.immersiveDialogSelector)

            // validate prove bio
            const proveTextarea = await snsPage.evaluateHandle(
                `document.querySelector('${sns.immersiveDialogSelector}').shadowRoot.querySelector('[data-testid="prove_textarea"]')`,
            )
            const proveContent = await proveTextarea.asElement()?.evaluate((e) => e.textContent)
            expect(proveContent).toBeTruthy()

            // click the 'add it for me' button
            await snsPage.waitFor(500)
            const addButton = await snsPage.evaluateHandle(
                `document.querySelector('${sns.immersiveDialogSelector}').shadowRoot.querySelector('[data-testid="add_button"]')`,
            )

            // listening 'dialog' event
            return new Promise(async (resolve) => {
                snsPage.on('dialog', async (dialog) => {
                    const message = dialog.message()
                    await dialog.dismiss()

                    // wait for auto pasting
                    await snsPage.waitFor(2000)

                    // does auto pasting works?
                    if (message.includes(proveContent!)) {
                        console.warn('auto pasting not works')
                    } else {
                        const descriptionTextarea: ElementHandle<HTMLTextAreaElement> = await snsPage.waitFor(
                            sns.bioTextareaSelector,
                        )
                        expect(
                            (await descriptionTextarea.evaluate((e) => e.value)).includes(proveContent!),
                        ).toBeTruthy()
                    }
                    resolve()
                })
                await (addButton as any).click()
            })
        })
    }
})
