import * as dashboard from '../../commands/dashboard'
import { SETUP_STORY_URL } from '../../support/constants'
import * as helpers from '../../support/helpers'
import Twitter from '../../commands/twitter'
import Facebook from '../../commands/facebook'

beforeEach(async () => {
    // setup page
    await helpers.setupPage(page)

    // restore alice's db backup
    await dashboard.openSetupCreatePersona(page)
})

afterEach(async () => {
    // reset dashboard
    await dashboard.reset(page)
})

describe(`${SETUP_STORY_URL}-Workflow1A:CoreInit/NewUser`, () => {
    for (const sns of [new Twitter('', '', ''), new Facebook('', '', '')]) {
        it(sns.name, async () => {
            // fill & submit the form
            const usernameInput = await page.waitFor('[data-testid="username_input"]')
            const nextButton = await page.waitFor('[data-testid="next_button"]')
            await usernameInput.type('alice')
            await nextButton.click()
            await page.waitFor(500)

            // evaluate network
            expect((await page.evaluate(() => location.hash)).includes('#/setup/connect-network')).toBeTruthy()
        })
    }
})
