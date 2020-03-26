import * as dashboard from '../../commands/dashboard'
import { INITIALIZATION_STORY_URL } from '../../support/constants'
import Twitter from '../../commands/twitter'
import Facebook from '../../commands/facebook'

beforeAll(async () => {
    // wait for default option page to be opened
    await page.waitFor(500)

    // set a modern viewport
    await page.setViewport({ width: 1366, height: 768 })
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1A:CoreInit/NewUser`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeNew(page)
    })

    afterEach(async () => {
        await dashboard.reset(page)
    })

    for (const sns of [new Twitter('', '', ''), new Facebook('', '', '')]) {
        it(sns.name, async () => {
            const usernameInput = await page.waitFor('[data-testid="initialization_username_input"]')
            const passwordInput = await page.waitFor('[data-testid="initialization_password_input"]')
            const nextButton = await page.waitFor('[data-testid="initialization_next_button"]')

            await usernameInput.type('Alice')
            await passwordInput.type('12345678')
            await nextButton.click()
            await page.waitFor(500)

            const targetSpy = jasmine.createSpy()
            page.browser().on('targetcreated', targetSpy)

            const connectButton = await page.waitFor(`[data-testid="initialization_connect_button_${sns.name}"]`)
            await connectButton.click()
            await page.waitFor(500)

            expect(targetSpy).toHaveBeenCalled()
            expect(
                targetSpy.calls
                    .argsFor(0)[0] // target
                    .url()
                    .includes(sns.name),
            ).toBeTruthy()
        })
    }
})
