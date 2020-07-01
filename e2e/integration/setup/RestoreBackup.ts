import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import * as helpers from '../../support/helpers'
import { INITIALIZATION_STORY_URL } from '../../support/constants'

beforeAll(async () => {
    // setup page
    await helpers.setupPage(page)
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openSetupRestoreDatabase(page)
    })

    afterEach(async () => {
        await dashboard.reset(page)
    })

    for (const backup of [
        'db_backup_1_persona_1_profile',
        'db_backup_1_persona_0_profile',
        'db_backup_0_persona_0_profile',
        // 'db_backup_2_personas_0_profile', // TODO
    ]) {
        it(`backup file - ${backup}`, async () => {
            await restore.fromFile(page, join(__dirname, `../../fixtures/setup/${backup}.json`))
            switch (backup) {
                case 'db_backup_1_persona_1_profile':
                    const personaTitle = await page.waitFor('[data-testid="persona_title"]')
                    expect(await personaTitle.evaluate((e) => e.textContent?.toLowerCase())).toBe('alice')
                    break
                case 'db_backup_1_persona_0_profile':
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/2s')).toBeTruthy()
                    break
                case 'db_backup_0_persona_0_profile':
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/start')).toBeTruthy()
                    break
            }
        })
    }
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openSetupRestoreDatabase(page)
    })

    afterEach(async () => {
        await dashboard.reset(page)
    })

    for (const backup of [
        'db_backup_1_persona_1_profile',
        'db_backup_1_persona_0_profile',
        'db_backup_0_persona_0_profile',
        // 'db_backup_2_personas_0_profile', // TODO
    ]) {
        it(`text - ${backup}`, async () => {
            await restore.fromText(page, join(__dirname, `../../fixtures/setup/${backup}.json`))
            switch (backup) {
                case 'db_backup_1_persona_1_profile':
                    const personaTitle = await page.waitFor('[data-testid="persona_title"]')
                    expect(await personaTitle.evaluate((e) => e.textContent?.toLowerCase())).toBe('alice')
                    break
                case 'db_backup_1_persona_0_profile':
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/2s')).toBeTruthy()
                    break
                case 'db_backup_0_persona_0_profile':
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/start')).toBeTruthy()
                    break
            }
        })
    }
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openSetupRestoreDatabaseAdvance(page)
    })

    afterEach(async () => {
        await dashboard.reset(page)
    })

    for (const record of [
        // TODO
        // {
        //     title: 'advance - import success  DDAI',
        // },
        {
            title: 'advance mode - import success',
            name: 'test',
            words: 'tongue gallery cinnamon glove chapter garage very hybrid answer olympic duty sound',
            password: '12345678',
        },
        {
            title: 'advance mode - import fail',
            name: 'test',
            words: 'test',
            password: 'test',
        },
    ]) {
        it(record.title, async () => {
            await restore.fromPersona(page, record)
            if (record.title === 'advance mode - import success') {
                expect((await page.evaluate(() => location.hash)).includes('#/initialize/2s')).toBeTruthy()
            }
        })
    }
})
