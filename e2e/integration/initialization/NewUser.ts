import * as dashboard from '../../commands/dashboard'
import { INITIALIZATION_STORY_URL } from '../../support/constants'

describe(`${INITIALIZATION_STORY_URL}-Workflow1A:CoreInit/NewUser`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeNew(page)
        await page.waitFor(500)
    })

    afterEach(async () => {
        await dashboard.reset(page)
    })

    for (const sns of ['facebook.com', 'twitter.com']) {
        it(sns, async () => {
            const usernameInput = await page.waitFor('[data-testid="initialization_username_input"]')
            const passwordInput = await page.waitFor('[data-testid="initialization_password_input"]')
            const nextButton = await page.waitFor('[data-testid="initialization_next_button"]')

            await usernameInput.type('alice')
            await passwordInput.type('12345678')
            await nextButton.click()

            const targetSpy = jasmine.createSpy()
            page.browser().on('targetcreated', targetSpy)

            const connectButton = await page.waitFor(`[data-testid="initialization_connect_button_${sns}"]`)
            await connectButton.click() // no premission prmopt in real E2E testing
            await page.waitFor(1000) // wait for new pages to be opened

            expect(targetSpy).toHaveBeenCalled()
            expect(
                targetSpy.calls
                    .argsFor(0)[0] // target
                    .url()
                    .includes(sns),
            ).toBeTruthy()
        })
    }
})
