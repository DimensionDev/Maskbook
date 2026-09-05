import { Sniffings } from '@masknet/shared-base'

export const injectedScriptURL = '/js/injected-script.js'

export async function evaluateContentScript(tabId: number | undefined, frameId?: number) {
    if (tabId === undefined) {
        const activeTab = await browser.tabs.query({ active: true })
        if (!activeTab.length) return
        tabId = activeTab[0].id
    }
    if (!tabId) return
    const script = {
        target: { tabId, frameIds: frameId ? [frameId] : undefined },
        files: contentScriptList,
        world: 'ISOLATED' as any,
    }
    if (Sniffings.is_firefox) delete script.world
    await browser.scripting.executeScript(script)
}
export const contentScriptList = [
    '/js/patches.js',
    '/js/polyfill/ecmascript.js',
    '/js/polyfill/dom.js',
    '/js/polyfill/browser-polyfill.js',
    '/js/sentry.js',
    '/js/sentry-patch.js',
    '/js/polyfill/lockdown.js',
    '/js/trusted-types.js',
    '/js/lockdown.js',
    '/cs.js',
]

export function ignoreInjectError(arg: unknown): (reason: Error) => void {
    return (error) => {
        const ignoredErrorMessages = ['non-structured-clonable data', 'No tab with id']
        if (ignoredErrorMessages.some((x) => error.message.includes(x))) return
        console.error('[Mask] Inject error', error.message, arg, error)
    }
}
