import { hmr } from '../../../utils-pure/hmr.js'
import type { ExtensionTypes, WebNavigation } from 'webextension-polyfill'
import {
    evaluateContentScript,
    ignoreInjectError,
    injectUserScriptMV2,
    injectedScriptURL,
} from '../../utils/injectScript.js'

const { signal } = hmr(import.meta.webpackHot)
if (typeof browser.scripting?.registerContentScripts === 'undefined') InjectContentScript(signal)

async function onCommittedListener(arg: WebNavigation.OnCommittedDetailsType): Promise<void> {
    if (!arg.url.startsWith('http')) return
    const contains = await browser.permissions.contains({ origins: [arg.url] })
    if (!contains) return

    const detail: ExtensionTypes.InjectDetails = { runAt: 'document_start', frameId: arg.frameId }
    const err = ignoreInjectError(arg)

    if (globalThis.navigator?.userAgent.includes('Firefox')) {
        browser.tabs.executeScript(arg.tabId, { ...detail, file: injectedScriptURL }).catch(err)
    } else {
        browser.tabs
            .executeScript(arg.tabId, { ...detail, code: await injectUserScriptMV2(injectedScriptURL) })
            .catch(err)
    }

    evaluateContentScript(arg.tabId, arg.frameId).catch(err)
}
async function InjectContentScript(signal: AbortSignal) {
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))
}
