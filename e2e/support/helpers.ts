import { readFileSync } from 'fs'
import { Page, ElementHandle, Dialog, Browser } from 'puppeteer'

export function screenshot(name: string) {
    return page.screenshot({
        path: `./screenshots/${name}.png`,
    })
}

// more: https://github.com/puppeteer/puppeteer/issues/3718#issuecomment-451325093
export async function getPageByUrl(browser: Browser, url: string) {
    return (await browser.targets()).find(t => t.url() === url)?.page()
}

export async function uploadFile(input: ElementHandle<HTMLInputElement>, ...filePaths: string[]) {
    // reveal the upload node ensure uploadFile method is working
    await input.evaluate(e => (e.style.display = 'block'))
    await input.uploadFile(...filePaths)
    // manually trigger change event for react
    await input.evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })))
}

export function loadFile(filePath: string) {
    return readFileSync(filePath).toString('utf8')
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
