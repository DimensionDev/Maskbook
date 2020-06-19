import type { Page, ElementHandle } from 'puppeteer'
import { uploadFile, updateInput, loadFile, loadFileTmp } from '../support/helpers'

export async function fromFile(page: Page, backup: string) {
    const fileTab = await page.waitFor('[data-testid="file_tab"]')
    await fileTab.click()
    await page.waitFor(500)

    const fileInput = await page.waitFor('[data-testid="file_input"]')
    await uploadFile(fileInput, loadFileTmp(backup))

    const restoreButton = await page.waitFor('[data-testid="restore_button"]')
    await restoreButton.click()
    await page.waitFor(500)

    const confirmButton = await page.waitFor('[data-testid="confirm_button"]')
    await confirmButton.click()
    await page.waitFor(500)

    const finishButton = await page.waitFor('[data-testid="finish_button"]')
    await finishButton.click()
    await page.waitFor(500)
}

export async function fromText(page: Page, backup: string) {
    const textTab = await page.waitFor('[data-testid="text_tab"]')
    await textTab.click()
    await page.waitFor(500)

    const uploadTextarea: ElementHandle<HTMLTextAreaElement> = await page.waitFor('[data-testid="text_textarea"]')
    await updateInput(uploadTextarea, loadFile(backup))

    const restoreButton = await page.waitFor('[data-testid="restore_button"]')
    await restoreButton.click()
    await page.waitFor(500)

    const confirmButton = await page.waitFor('[data-testid="confirm_button"]')
    await confirmButton.click()
    await page.waitFor(500)

    const finishButton = await page.waitFor('[data-testid="finish_button"]')
    await finishButton.click()
    await page.waitFor(500)
}

export async function fromPersona(
    page: Page,
    record: { title: string; name: string; words: string; password: string },
) {
    const nameInput = await page.waitFor('[data-testid="username_input"]')
    const mnemonicInput = await page.waitFor('[data-testid="mnemonic_input"]')
    const passwordInput = await page.waitFor('[data-testid="password_input"]')
    const importButton = await page.waitFor('[data-testid="import_button"]')
    await nameInput.type(record.name)
    await mnemonicInput.type(record.words)
    await passwordInput.type(record.password)
    await importButton.click()
    await page.waitFor(500)
}
