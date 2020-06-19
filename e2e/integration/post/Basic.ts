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
    await dashboard.openInitializeRestore(page)
    await restore.fromFile(page, '../fixtures/post/db_backup_alice.json')
})

afterAll(async () => {
    await dashboard.reset(page)
})

describe(`${CREATE_POST_STORY_URL}#Story:CreatePost(?br=wip)-BasicWorkflow`, () => {
    for (const enableImageMode of [false, true]) {
        for (const sns of [
            // new Twitter(
            //     process.env.E2E_ALICE_TWITTER_ID!,
            //     process.env.E2E_ALICE_TWITTER_USERNAME!,
            //     process.env.E2E_ALICE_TWITTER_PASSWORD!,
            // ),
            new Facebook(
                process.env.E2E_ALICE_FACEBOOK_ID!,
                process.env.E2E_ALICE_FACEBOOK_USERNAME!,
                process.env.E2E_ALICE_FACEBOOK_PASSWORD!,
            ),
        ]) {
            it(`${sns.name} with ${enableImageMode ? 'image based payload' : 'generic payload'}`, async () => {
                // login sns account
                const loginPage = await helpers.newPage(page)
                await sns.login(loginPage)
                await loginPage.close()

                // setup a new page
                const snsPage = await helpers.newPage(page)

                // open sns news feed
                await sns.openNewsFeed(snsPage)

                // click compose button if needed
                if (sns.composeButtonSelector) {
                    const composeButton = await snsPage.waitFor(sns.composeButtonSelector)
                    await composeButton.click()
                    await snsPage.waitFor(500)
                }

                // wait maskbook inject post dialog hint
                await snsPage.waitFor(sns.postDialogHintSelector)

                // click the hint button open maskbook post composing view
                await snsPage.waitFor(500)
                const hintButton = await snsPage.evaluateHandle(
                    `document.querySelector('${sns.postDialogHintSelector}').shadowRoot.querySelector('[data-testid="hint_button"]')`,
                )
                await (hintButton as any).click()

                // type plain text
                await snsPage.waitFor(500)
                const textTextarea = await snsPage.evaluateHandle(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="text_textarea"]')`,
                )
                await (textTextarea as any).type('maskbook')

                // designates recipients
                await snsPage.waitFor(500)
                const defaultGroupChip = await snsPage.evaluateHandle(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="_default_friends_group_"]')`,
                )
                await (defaultGroupChip as any).click()

                // trun on/off image-based payload switch
                const dashboardPage = await helpers.newPage(page)
                await dashboard.toggleImagePayload(dashboardPage, enableImageMode)
                await dashboardPage.close()

                // click the finish
                await snsPage.waitFor(500)
                const finishButton = await snsPage.evaluateHandle(
                    `document.querySelector('${sns.postDialogModalSelector}').shadowRoot.querySelector('[data-testid="finish_button"]')`,
                )
                await (finishButton as any).click()

                // validate text
                await snsPage.waitFor(2000)
                const payloadTextarea = await snsPage.waitFor(sns.composeEditorSelector)
                const cipherText = await payloadTextarea.evaluate(e => e.textContent)
                expect(cipherText?.includes('Maskbook')).toBe(true)

                // valdiate attachment
                if (enableImageMode) {
                    const payloadImage = await snsPage.waitFor(sns.composeImageSelector)
                    const imageUrl = await payloadImage.evaluate(e => e.getAttribute('src'))
                    expect(imageUrl).toBeTruthy()
                }

                // close the page
                await snsPage.close()
            })
        }
    }
})
