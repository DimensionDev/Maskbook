import { Page, ElementHandle } from 'puppeteer'
import { DASHBOARD_URL } from '../support/constants'

export async function login(page: Page, username: string, password: string) {
    await page.bringToFront()
    await page.goto('https://twitter.com/login')
    const nameInput = await page.waitFor('[name="session[username_or_email]"]')
    const passwordInput = await page.waitFor('[name="session[password]"]')
    const submitButton = await page.waitFor('[data-testid="LoginForm_Login_Button"]')
    await nameInput.type(username)
    await passwordInput.type(password)
    await submitButton.click()
}

export async function logout(page: Page) {
    await page.bringToFront()
    await page.goto('https://twitter.com/logout')
    const confirmButton = await page.waitFor('[role=alertdialog] [role=button]:first-child')
    await confirmButton.click()
}

export async function setBio(page: Page, bio: string) {
    await page.bringToFront()
    await page.goto(`https://twitter.com/settings/profile`)
    const bioTextarea: ElementHandle<HTMLTextAreaElement> = await page.waitFor('textarea[name="description"]')
    const saveButton = await page.waitFor('[data-testid="Profile_Save_Button"]')
    await bioTextarea.evaluate(e => (e.value = bio))
    await saveButton.click()
    await page.waitFor('[href="/settings/profile"]') // confirm back to profile page
}

export async function unsetBio(page: Page) {
    return setBio(page, '')
}

export async function deleteTweet(page: Page, username: string, id: string) {
    await page.bringToFront()
    await page.goto(`https://twitter.com/${username}/status/${id}`)
    const caretButton = await page.waitFor('[data-testid="caret"]')
    await caretButton.click()
    const deleteButton = await page.waitFor('[role="menu"] [role="menuitem"]:first-child')
    await deleteButton.click()
    const confirmButton = await page.waitFor('[data-testid="confirmationSheetConfirm"]')
    await confirmButton.click()
    await page.waitFor('[href="/settings/profile"]') // confirm back to profile page
}
