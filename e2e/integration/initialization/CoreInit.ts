import * as dashboard from '../../commands/dashboard'
import { INITIALIZATION_STORY_URL } from '../../support/constants'

beforeAll(async () => {
    // wait for default option page to be opened
    await page.waitFor(500)

    // set a modern viewport
    await page.setViewport({ width: 1366, height: 768 })
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1:CoreInit`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeStart(page)
    })

    it('setup', async () => {
        const setupButton = await page.waitFor('[data-testid="setup_button"]')
        await setupButton.click()
        await page.waitFor(500)
        expect((await page.evaluate(() => location.hash)).includes('#/initialize/1s')).toBeTruthy()
    })

    it('restore', async () => {
        const restoreButton = await page.waitFor('[data-testid="restore_button"]')
        await restoreButton.click()
        await page.waitFor(500)
        expect((await page.evaluate(() => location.hash)).includes('#/initialize/1r')).toBeTruthy()
    })
})
