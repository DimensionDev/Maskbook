import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import { CREATE_POST_STORY_URL } from '../../support/constants'
import Twitter from '../../commands/twitter'
import Facebook from '../../commands/facebook'
import * as helpers from '../../support/helpers'

beforeAll(async () => {
    // setup page
    await helpers.setupPage(page)

    // restore alice's db backup
    await dashboard.openSetupRestoreDatabase(page)
    await restore.fromFile(page, join(__dirname, '../../fixtures/persona/persona_backup_alice.json'))
})

afterAll(async () => {
    // reset datashboard
    await dashboard.reset(page)
})

describe(`${CREATE_POST_STORY_URL}#Story:CreatePost(?br=wip)-BasicWorkflow`, () => {
    for (const enableImageMode of [false, true]) {
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

            it(`create ${enableImageMode ? 'image-based payload' : 'generic payload'} on ${sns.name}`, async () => {
                // login sns account
                const loginPage = await helpers.newPage(page)
                await sns.login(loginPage)
                await loginPage.close()

                // setup a new page
                const snsFeedPage = await helpers.newPage(page)

                // open sns news feed
                await sns.openNewsFeed(snsFeedPage)

                // ads or notification dialogs will fail clicking
                await sns.dimissDialog(snsFeedPage)

                // click compose button if needed
                if (sns.composeButtonSelector) {
                    const composeButton = await snsFeedPage.waitFor(sns.composeButtonSelector)
                    await composeButton.click()
                    await snsFeedPage.waitFor(500)
                }

                // wait maskbook inject post dialog hint
                await snsFeedPage.waitFor(sns.postDialogHintSelector)

                // click the hint button open maskbook post composing view
                const hintButton = await snsFeedPage.waitForFunction(
                    `document.querySelector('${sns.postDialogHintSelector}').shadowRoot.querySelector('[data-testid="hint_button"]')`,
                )
                await (hintButton as any).click()
                await snsFeedPage.waitFor(500)

                // wait maskbook inject post dialog modal
                await snsFeedPage.waitFor(sns.postDialogModalSelector)

                // type plain text
                const textTextarea = await snsFeedPage.waitForFunction(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="text_textarea"]')`,
                )
                await (textTextarea as any).type('maskbook')
                await snsFeedPage.waitFor(500)

                // designates recipients
                const everyoneGroupChip = await snsFeedPage.waitForFunction(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="_everyone_group_"]')`,
                )
                await (everyoneGroupChip as any).click()
                await snsFeedPage.waitFor(500)

                // trun on/off image-based payload switch
                const imageChip = await snsFeedPage.waitForFunction(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="image_chip"]')`,
                )
                const imageChipChecked = await imageChip
                    .asElement()
                    ?.evaluate((e) => /MuiChip-colorPrimary/.test(e.className))
                if (enableImageMode !== imageChipChecked) {
                    await (imageChip as any).click()
                    await snsFeedPage.waitFor(500)
                }

                // take screenshot
                await helpers.screenshot(snsFeedPage, `${sns.name}_post_compose_${enableImageMode ? 'image' : 'text'}`)

                // click the finish
                const finishButton = await snsFeedPage.waitForFunction(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="finish_button"]')`,
                )
                await (finishButton as any).click()
                await snsFeedPage.waitFor(5000)

                // validate text
                const payloadTextarea = await snsFeedPage.waitFor(sns.composeEditorSelector)
                const cipherText = await payloadTextarea.evaluate((e) => e.textContent)
                expect(cipherText?.includes('Maskbook')).toBeTruthy()

                // valdiate attachment
                if (enableImageMode) {
                    const payloadImage = await snsFeedPage.waitFor(sns.composeImageSelector)
                    const imageUrl = await payloadImage.evaluate((e) => e.getAttribute('src'))
                    expect(imageUrl).toBeTruthy()
                }

                // take screenshot
                await helpers.screenshot(snsFeedPage, `${sns.name}_post_create_${enableImageMode ? 'image' : 'text'}`)

                // close the page
                await snsFeedPage.close()
            })
        }
    }
})
