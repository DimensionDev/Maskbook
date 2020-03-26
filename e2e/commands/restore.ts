import { Page, ElementHandle } from 'puppeteer'
import { join } from 'path'
import { uploadFile, updateInput, loadFile } from '../support/helpers'

export async function fromFile(page: Page, backup: string) {
    const fileTab = await page.waitFor('[data-testid="initialization_file_tab"]')
    await fileTab.click()
    await page.waitFor(500)

    const uploadInput = await page.waitFor('[data-testid="initialization_upload_input"]')
    await uploadFile(uploadInput, join(__dirname, backup))

    const finishButton = await page.waitFor('[data-testid="initialization_finish_button"]')
    await finishButton.click()
    await page.waitFor(500)
}

export async function fromText(page: Page, backup: string) {
    const textTab = await page.waitFor('[data-testid="initialization_text_tab"]')
    await textTab.click()
    await page.waitFor(500)

    const uploadTextarea: ElementHandle<HTMLTextAreaElement> = await page.waitFor(
        '[data-testid="initialization_upload_textarea"]',
    )
    await updateInput(uploadTextarea, loadFile(join(__dirname, backup)))

    const restoreButton = await page.waitFor('[data-testid="initialization_restore_button"]')
    await restoreButton.click()

    const finishButton = await page.waitFor('[data-testid="initialization_finish_button"]')
    await finishButton.click()
    await page.waitFor(500)
}

export async function fromPersona(
    page: Page,
    record: { title: string; name: string; words: string; password: string },
) {
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
    await page.waitFor(500)
}
