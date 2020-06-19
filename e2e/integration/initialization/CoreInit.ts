import * as dashboard from '../../commands/dashboard'
import { INITIALIZATION_STORY_URL } from '../../support/constants'

describe(`${INITIALIZATION_STORY_URL}-Workflow1:CoreInit`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeStart(page)
        await page.waitFor(500)
    })

    it('setup', async () => {
        const setupButton = await page.waitFor('[data-testid="initialization_setup_button"]')
        await setupButton.click()
        expect((await page.evaluate(() => location.hash)).includes('#/initialize/1s')).toBeTruthy()
    })

    it('restore', async () => {
        const restoreButton = await page.waitFor('[data-testid="initialization_restore_button"]')
        await restoreButton.click()
        expect((await page.evaluate(() => location.hash)).includes('#/initialize/1r')).toBeTruthy()
    })
})
