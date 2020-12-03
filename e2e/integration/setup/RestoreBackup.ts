import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import * as helpers from '../../support/helpers'
import { SETUP_STORY_URL } from '../../support/constants'

beforeEach(async () => {
    // setup page
    await helpers.setupPage(page)

    // open restore page
    await dashboard.openSetupRestoreDatabase(page)
})

afterEach(async () => {
    // reset dashboard
    await dashboard.reset(page)
})

describe(`${SETUP_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    for (const method of ['fromFile', 'fromText'] as const) {
        for (const backup of [
            'db_backup_0_persona_0_profile',
            'db_backup_1_persona_0_profile',
            'db_backup_1_persona_1_profile',
            'db_backup_2_personas_0_profile',
            'db_backup_2_personas_2_profiles',
        ]) {
            it(`backup file - ${backup}`, async () => {
                await restore[method](page, join(__dirname, `../../fixtures/setup/${backup}.json`))
                switch (backup) {
                    case 'db_backup_0_persona_0_profile':
                        expect(
                            (await page.evaluate(() => location.hash)).includes('#/setup/create-persona'),
                        ).toBeTruthy()
                        break
                    case 'db_backup_1_persona_0_profile':
                        expect(
                            (await page.evaluate(() => location.hash)).includes('#/setup/connect-network'),
                        ).toBeTruthy()
                        break
                    case 'db_backup_1_persona_1_profile':
                        const personaTitle = await page.waitForSelector('[data-testid="persona_title"]')
                        expect(await personaTitle.evaluate((e) => e.textContent?.toLowerCase())).toBe('alice')
                        break
                    default:
                        await page.waitForSelector('[data-testid="persona_title"]')
                        const titles = await page.evaluate(() =>
                            Array.from(document.querySelectorAll('[data-testid="persona_title"]')).map((e) =>
                                e.textContent?.toLowerCase(),
                            ),
                        )
                        expect(titles.includes('alice')).toBeTruthy()
                        expect(titles.includes('bob')).toBeTruthy()
                        break
                }
            })
        }
    }
})
