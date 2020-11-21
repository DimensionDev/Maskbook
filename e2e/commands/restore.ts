import type { Page, ElementHandle } from 'puppeteer'
import { uploadFile, updateInput, loadFile, loadFileTmp, screenshot } from '../support/helpers'

export async function fromFile(page: Page, backup: string) {
    const fileTab = await page.waitForSelector('[data-testid="file_tab"]')
    await fileTab.click()
    await page.waitForTimeout(500)

    const fileInput = await page.waitForSelector('[data-testid="file_input"]')
    await uploadFile(fileInput, loadFileTmp(backup))

    const restoreButton = await page.waitForSelector('[data-testid="restore_button"]')
    await restoreButton.click()
    await page.waitForTimeout(500)

    const confirmButton = await page.waitForSelector('[data-testid="confirm_button"]')
    await confirmButton.click()
    await page.waitForTimeout(500)

    const finishButton = await page.waitForSelector('[data-testid="finish_button"]')
    await finishButton.click()
    await page.waitForTimeout(500)
}

export async function fromText(page: Page, backup: string) {
    const textTab = await page.waitForSelector('[data-testid="text_tab"]')
    await textTab.click()
    await page.waitForTimeout(500)

    const uploadTextarea: ElementHandle<HTMLTextAreaElement> = await page.waitForSelector(
        '[data-testid="text_textarea"]',
    )
    await updateInput(uploadTextarea, loadFile(backup))

    const restoreButton = await page.waitForSelector('[data-testid="restore_button"]')
    await restoreButton.click()
    await page.waitForTimeout(500)

    const confirmButton = await page.waitForSelector('[data-testid="confirm_button"]')
    await confirmButton.click()
    await page.waitForTimeout(500)

    const finishButton = await page.waitForSelector('[data-testid="finish_button"]')
    await finishButton.click()
    await page.waitForTimeout(500)
}

export async function fromPersona(
    page: Page,
    record: { title: string; name: string; words: string; password: string },
) {
    const nameInput = await page.waitForSelector('[data-testid="username_input"]')
    const mnemonicInput = await page.waitForSelector('[data-testid="mnemonic_input"]')
    const passwordInput = await page.waitForSelector('[data-testid="password_input"]')
    const importButton = await page.waitForSelector('[data-testid="import_button"]')
    await nameInput.type(record.name)
    await mnemonicInput.type(record.words)
    await passwordInput.type(record.password)
    await importButton.click()
    await page.waitForTimeout(500)
}
