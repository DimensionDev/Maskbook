import * as dashboard from '../../commands/dashboard'
import * as restore from '../../commands/restore'
import { INITIALIZATION_STORY_URL } from '../../support/constants'

beforeAll(async () => {
    // wait for default option page to be opened
    await page.waitFor(500)

    // set a modern viewport
    await page.setViewport({ width: 1366, height: 768 })
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeRestore(page)
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
            await restore.fromFile(page, `../fixtures/initialization/${backup}.json`)
            switch (backup) {
                case 'db_backup_1_persona_1_profile':
                    const personaTitle = await page.waitFor('[data-testid="initialization_persona_title"]')
                    expect(await personaTitle.evaluate(e => e.textContent?.toLowerCase())).toBe('alice')
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
        await dashboard.openInitializeRestore(page)
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
            await restore.fromText(page, `../fixtures/initialization/${backup}.json`)
            switch (backup) {
                case 'db_backup_1_persona_1_profile':
                    const personaTitle = await page.waitFor('[data-testid="initialization_persona_title"]')
                    expect(await personaTitle.evaluate(e => e.textContent?.toLowerCase())).toBe('alice')
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
        await dashboard.openInitializePersona(page)
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
