import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import { READ_POST_STORY_URL } from '../../support/constants'
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

describe(`${READ_POST_STORY_URL}#Story:ReadPost(?br=wip)-BasicWorkflow`, () => {
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

        const posts = helpers.loadJSON(join(__dirname, `../../fixtures/post/post_backup_${sns.name}.json`)) as {
            url: string
            text: string
            description?: string
        }[]

        // no posts found for sns
        if (!posts || !posts.length) continue

        for (const { url, description, text } of posts) {
            it(`read ${description} on ${sns.name}`, async () => {
                // setup a new page
                const snsPostPage = await helpers.newPage(page)

                // open post
                await snsPostPage.goto(url, {
                    waitUntil: 'load',
                })

                // dismiss dialogs
                await sns.dimissDialog(snsPostPage)

                // wait maskbook decrypt the payload
                await snsPostPage.waitFor(sns.postAffixingCanvasSelector)

                // validate the payload
                const textPayload = await snsPostPage.waitForFunction(
                    `document.querySelector('${sns.postAffixingCanvasSelector}').shadowRoot.querySelector('.post-inspector [data-testid="text_payload"]')`,
                )
                const content = await (textPayload as any).evaluate((e: HTMLElement) => e.textContent)
                expect(content.includes(text) || content.includes('Maskbook does not find the post key.')).toBeTruthy()

                // take screenshot
                await helpers.screenshot(snsPostPage, `${sns.name}_post_read_${description}`)

                // close the page
                await snsPostPage.close()
            })
        }
    }
})
