import type { Page, ElementHandle, Browser } from 'puppeteer'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { tmpdir } from 'os'

export function screenshot(page: Page, name: string) {
    return page.screenshot({
        path: join(process.cwd(), 'screenshots', `${name}.png`),
    })
}

export async function newPage(page: Page) {
    const _newPage = await page.browser().newPage()
    await setupPage(_newPage)
    return _newPage
}

export async function setupPage(page: Page) {
    // wait for default option page to be opened
    await page.waitForTimeout(500)

    // set a modern viewport
    await page.setViewport({ width: 1366, height: 768 })
    await page.waitForTimeout(500)
}

// more: https://github.com/puppeteer/puppeteer/issues/3718#issuecomment-451325093
export async function getPageByUrl(browser: Browser, url: string) {
    return (await browser.targets()).find((t) => t.url() === url)?.page()
}

export async function uploadFile(input: ElementHandle<HTMLInputElement>, ...filePaths: string[]) {
    // reveal the upload node ensure uploadFile method is working
    await input.evaluate((e) => (e.style.display = 'block'))
    await input.uploadFile(...filePaths)
    // manually trigger change event for react
    await input.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true })))
}

export function loadFile(filePath: string) {
    return readFileSync(filePath)
        .toString('utf8')
        .replace(/%E2E_ALICE_TWITTER_ID%/g, process.env.E2E_ALICE_TWITTER_ID || 'alice')
        .replace(/%E2E_ALICE_FACEBOOK_ID%/g, process.env.E2E_ALICE_FACEBOOK_ID || 'alice')
        .replace(/%E2E_BOB_TWITTER_ID%/g, process.env.E2E_BOB_TWITTER_ID || 'bob')
        .replace(/%E2E_BOB_FACEBOOK_ID%/g, process.env.E2E_BOB_FACEBOOK_ID || 'bob')
}

export function loadFileTmp(filePath: string) {
    const tmpContent = loadFile(filePath)
    const tmpPath = join(tmpdir(), createHash('md5').update(tmpContent).digest().toString('hex'))
    writeFileSync(tmpPath, tmpContent)
    return tmpPath
}

export function loadJSON(filePath: string) {
    return JSON.parse(loadFile(filePath))
}

// more: https://github.com/facebook/react/issues/11488#issuecomment-347775628
export async function updateInput(input: ElementHandle<HTMLInputElement | HTMLTextAreaElement>, content: string) {
    await input.evaluateHandle((e, newValue) => {
        e.value = newValue
        const ev = new Event('input', { bubbles: true })
        ;(ev as any).simulated = true
        const tracker = (e as any)._valueTracker
        if (tracker) {
            tracker.setValue('')
        }
        e.dispatchEvent(ev)
    }, content)
}
