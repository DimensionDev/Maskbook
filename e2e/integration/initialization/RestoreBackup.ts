import { join } from 'path'
import * as dashboard from '../../commands/dashboard'
import { uploadFile, updateInput, loadFile, screenshot } from '../../support/helpers'
import { INITIALIZATION_STORY_URL } from '../../support/constants'
import { ElementHandle } from 'puppeteer'

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeRestore(page)
        await page.waitFor(500)
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
            const fileTab = await page.waitFor('[data-testid="initialization_file_tab"]')
            await fileTab.click()
            const uploadInput = await page.waitFor('[data-testid="initialization_upload_input"]')
            await uploadFile(uploadInput, join(__dirname, `../../fixtures/initialization/${backup}.json`))
            const finishButton = await page.waitFor('[data-testid="initialization_finish_button"]')
            await finishButton.click()

            switch (backup) {
                case 'db_backup_1_persona_1_profile':
                    const personaTitle = await page.waitFor('[data-testid="initialization_persona_title"]')
                    expect(await personaTitle.evaluate(e => e.textContent?.toLowerCase())).toBe('alice')
                    break
                case 'db_backup_1_persona_0_profile':
                    await page.waitFor(500)
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/2s')).toBeTruthy()
                    break
                case 'db_backup_0_persona_0_profile':
                    await page.waitFor(500)
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/start')).toBeTruthy()
                    break
            }
        })
    }
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openInitializeRestore(page)
        await page.waitFor(500)
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
            const textTab = await page.waitFor('[data-testid="initialization_text_tab"]')
            await textTab.click()
            const uploadTextarea: ElementHandle<HTMLTextAreaElement> = await page.waitFor(
                '[data-testid="initialization_upload_textarea"]',
            )
            await updateInput(uploadTextarea, loadFile(join(__dirname, `../../fixtures/initialization/${backup}.json`)))
            const restoreButton = await page.waitFor('[data-testid="initialization_restore_button"]')
            await restoreButton.click()
            const finishButton = await page.waitFor('[data-testid="initialization_finish_button"]')
            await finishButton.click()

            switch (backup) {
                case 'db_backup_1_persona_1_profile':
                    const personaTitle = await page.waitFor('[data-testid="initialization_persona_title"]')
                    expect(await personaTitle.evaluate(e => e.textContent?.toLowerCase())).toBe('alice')
                    break
                case 'db_backup_1_persona_0_profile':
                    await page.waitFor(500)
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/2s')).toBeTruthy()
                    break
                case 'db_backup_0_persona_0_profile':
                    await page.waitFor(500)
                    expect((await page.evaluate(() => location.hash)).includes('#/initialize/start')).toBeTruthy()
                    break
            }
        })
    }
})

describe(`${INITIALIZATION_STORY_URL}-Workflow1B:CoreInit/RestoreBackup`, () => {
    beforeEach(async () => {
        await dashboard.openInitializePersona(page)
        await page.waitFor(500)
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
            const nameInput = await page.waitFor('[data-testid="initialization_username_input"]')
            const mnemonicInput = await page.waitFor('[data-testid="initialization_mnemonic_input"]')
            const passwordInput = await page.waitFor('[data-testid="initialization_password_input"]')
            const importButton = await page.waitFor('[data-testid="initialization_import_button"]')
            await nameInput.type(record.name)
            await mnemonicInput.type(record.words)
            await passwordInput.type(record.password)
            await importButton.click()
            await page.waitFor(500)
            const confirmButton = await page.waitFor('[data-testid="initialization_dialog_comfirm_button"]')
            await confirmButton.click()

            if (record.title === 'advance mode - import success') {
                // wait for connect profile page to be opened
                await page.waitFor(500)
                expect((await page.evaluate(() => location.hash)).includes('#/initialize/2s')).toBeTruthy()
            }
        })
    }
})
