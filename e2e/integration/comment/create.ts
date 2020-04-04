import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import { CREATE_COMMENT_STORY_URL } from '../../support/constants'
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

describe(`${CREATE_COMMENT_STORY_URL}#Story:CreateComment(?br=wip)-BasicWorkflow`, () => {
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
        if (process.env.E2E_NETWORK_ID && process.env.E2E_NETWORK_ID !== sns.name) continue

        const posts = helpers.loadJSON(join(__dirname, `../../fixtures/comment/post_backup_${sns.name}.json`)) as {
            url: string
            description?: string
            text: string
        }[]

        // no posts found for sns
        if (!posts || !posts.length) continue

        it(`create comment on ${sns.name}`, async () => {
            // setup a new page
            const snsPostPage = await helpers.newPage(page)

            // open post
            await snsPostPage.goto(posts[0].url, {
                waitUntil: 'load',
            })

            // FIXME:
            // facebook cannot inject comment box after account just recovered
            if (sns.name === 'facebook.com') {
                await snsPostPage.reload({
                    waitUntil: 'load',
                })
            }

            // wait maskbook inject comment form
            await snsPostPage.waitFor(sns.commentBoxSelector)

            // input comment
            const commentInput = await snsPostPage.waitForFunction(
                `document.querySelector('${sns.commentBoxSelector}').shadowRoot.querySelector('[data-testid="comment_input"]')`,
            )
            await (commentInput as any).type('test')
            await (commentInput as any).press('Enter')

            // wait for auto pasting
            await snsPostPage.waitFor(500)

            // validate comment
            const originalCommentInput = await snsPostPage.waitFor(sns.commentInputSelector)
            const encryptedComment = await originalCommentInput.evaluate(e => e.textContent)
            expect(encryptedComment?.includes('🎶2/4')).toBeTruthy()

            // close the page
            await snsPostPage.close()
        })
    }

    // dismiss empty test suite error
    test.skip('skip', () => {})
})
