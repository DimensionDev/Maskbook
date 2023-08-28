import { memoize } from 'lodash-es'

export const injectedScriptURL = '/js/injected-script.js'
export const maskSDK_URL = '/js/mask-sdk.js'
const contentScriptURL = '/generated__content__script.html'

export async function evaluateContentScript(tabId: number | undefined, frameId?: number) {
    if (browser.scripting) {
        if (tabId === undefined) {
            const activeTab = await browser.tabs.query({ active: true })
            if (!activeTab.length) return
            tabId = activeTab[0].id
        }
        if (!tabId) return
        await browser.scripting.executeScript({
            target: { tabId, frameIds: frameId ? [frameId] : undefined },
            files: await fetchInjectContentScriptList(),
            world: 'ISOLATED',
        })
    } else {
        for (const script of await fetchInjectContentScriptList()) {
            await browser.tabs.executeScript(tabId, {
                file: script,
                frameId,
                runAt: 'document_idle',
            })
        }
    }
}
async function fetchInjectContentScriptList_raw() {
    const contentScripts: string[] = []
    const html = await fetch(contentScriptURL).then((x) => x.text())
    // We're not going to use DOMParser because it is not available in MV3.
    Array.from(html.matchAll(/<script src="([\w./-]+)"><\/script>/g)).forEach((script) =>
        contentScripts.push(new URL(script[1], browser.runtime.getURL('')).pathname),
    )

    const body = html.match(/<body>(.+)<\/body>/)![1]
    body.replaceAll('<script defer src="', '')
        .replaceAll('></script>', '')
        .split('"')
        .forEach((script) => {
            if (!script) return
            contentScripts.push(new URL(script, browser.runtime.getURL('')).pathname)
        })
    return contentScripts
}
export const fetchInjectContentScriptList =
    process.env.NODE_ENV === 'development'
        ? fetchInjectContentScriptList_raw
        : memoize(fetchInjectContentScriptList_raw)

async function injectUserScriptMV2_raw(url: string) {
    try {
        const code = await fetch(url).then((x) => x.text())
        return `{
            const script = document.createElement("script")
            script.innerHTML = ${JSON.stringify(code)}
            document.documentElement.appendChild(script)
        }`
    } catch (error) {
        console.error(error)
        return `console.log('[Mask] User script ${url} failed to load.')`
    }
}
export const injectUserScriptMV2 =
    process.env.NODE_ENV === 'development' ? injectUserScriptMV2_raw : memoize(injectUserScriptMV2_raw)

export function ignoreInjectError(arg: unknown): (reason: Error) => void {
    return (error) => {
        const ignoredErrorMessages = ['non-structured-clonable data', 'No tab with id']
        if (ignoredErrorMessages.some((x) => error.message.includes(x))) return
        console.error('[Mask] Inject error', error.message, arg, error)
    }
}
