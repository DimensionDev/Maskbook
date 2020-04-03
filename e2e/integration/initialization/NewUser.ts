import * as dashboard from '../../commands/dashboard'
import { INITIALIZATION_STORY_URL } from '../../support/constants'
import * as helpers from '../../support/helpers'
import Twitter from '../../commands/twitter'
import Facebook from '../../commands/facebook'

describe(`${INITIALIZATION_STORY_URL}-Workflow1A:CoreInit/NewUser`, () => {
    for (const sns of [new Twitter('', '', ''), new Facebook('', '', '')]) {
        it(sns.name, async () => {
            // setup page
            await helpers.setupPage(page)

            // open initialize page
            await dashboard.openInitializeNew(page)

            // fill & submit the form
            const usernameInput = await page.waitFor('[data-testid="username_input"]')
            const passwordInput = await page.waitFor('[data-testid="password_input"]')
            const nextButton = await page.waitFor('[data-testid="next_button"]')
            await usernameInput.type('Alice')
            await passwordInput.type('12345678')
            await nextButton.click()
            await page.waitFor(500)

            // setup spy for new page
            const targetSpy = jasmine.createSpy()
            page.browser().on('targetcreated', targetSpy)

            // click the connect button
            const connectButton = await page.waitFor(`[data-testid="connect_button_${sns.name}"]`)
            await connectButton.click()
            await page.waitFor(500)

            // validate spy
            expect(targetSpy).toHaveBeenCalled()
            expect(
                targetSpy.calls
                    .argsFor(0)[0] // target
                    .url()
                    .includes(sns.name),
            ).toBeTruthy()

            // reset dashboard
            await dashboard.reset(page)
        })
    }
})
