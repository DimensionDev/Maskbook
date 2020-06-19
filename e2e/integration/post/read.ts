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
    await dashboard.openInitializeRestore(page)
    await restore.fromFile(page, join(__dirname, '../../fixtures/persona/persona_backup_alice.json'))
})

afterAll(async () => {
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

                // wait maskbook decrypt the payload
                await snsPostPage.waitFor(sns.postAffixingCanvasSelector)

                // validate the payload
                const textPayload = await snsPostPage.waitForFunction(
                    `document.querySelector('${sns.postAffixingCanvasSelector}').shadowRoot.querySelector('[data-testid="text_payload"]')`,
                )
                expect(
                    (await (textPayload as any).evaluate((e: HTMLElement) => e.textContent)).includes(text),
                ).toBeTruthy()

                // close the page
                await snsPostPage.close()
            })
        }
    }
})
