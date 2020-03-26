import * as dashboard from '../../commands/dashboard'
import * as helpers from '../../support/helpers'
import { INITIALIZATION_STORY_URL } from '../../support/constants'

beforeAll(async () => {
    // setup page
    await helpers.setupPage(page)
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1:CoreInit`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeStart(page)
    })

    it('setup', async () => {
        // click the setup button
        const setupButton = await page.waitFor('[data-testid="setup_button"]')
        await setupButton.click()
        await page.waitFor(500)

        // open the setup page
        expect((await page.evaluate(() => location.hash)).includes('#/initialize/1s')).toBeTruthy()
    })

    it('restore', async () => {
        // click the restore button
        const restoreButton = await page.waitFor('[data-testid="restore_button"]')
        await restoreButton.click()
        await page.waitFor(500)

        // open the restore page
        expect((await page.evaluate(() => location.hash)).includes('#/initialize/1r')).toBeTruthy()
    })
})
