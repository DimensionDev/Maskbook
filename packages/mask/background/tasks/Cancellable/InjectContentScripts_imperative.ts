import { hmr } from '../../../utils-pure/hmr.js'
import type { ExtensionTypes, WebNavigation } from 'webextension-polyfill'
import {
    evaluateContentScript,
    ignoreInjectError,
    injectUserScriptMV2,
    injectedScriptURL,
    maskSDK_URL,
} from '../../utils/injectScript.js'
import { Sniffings } from '@masknet/shared-base'
import { matchesAnySiteAdaptor } from '../../../shared/site-adaptors/definitions.js'

const { signal } = hmr(import.meta.webpackHot)
if (typeof browser.scripting?.registerContentScripts === 'undefined') InjectContentScript(signal)

async function onCommittedListener(arg: WebNavigation.OnCommittedDetailsType): Promise<void> {
    if (!arg.url.startsWith('http')) return
    const contains = await browser.permissions.contains({ origins: [arg.url] })
    if (!contains) return

    const detail: ExtensionTypes.InjectDetails = { runAt: 'document_start', frameId: arg.frameId }
    const err = ignoreInjectError(arg)

    if (matchesAnySiteAdaptor(arg.url)) {
        // don't add await here. we don't want this to block the content script
        if (Sniffings.is_firefox) {
            browser.tabs.executeScript(arg.tabId, { ...detail, file: injectedScriptURL }).catch(err)
        } else {
            injectUserScriptMV2(injectedScriptURL)
                .then(async (code) => browser.tabs.executeScript(arg.tabId, { ...detail, code }))
                .catch(err)
        }
    }
    injectUserScriptMV2(maskSDK_URL)
        .then(async (code) => browser.tabs.executeScript(arg.tabId, { ...detail, code }))
        .catch(err)

    evaluateContentScript(arg.tabId, arg.frameId).catch(err)
}
async function InjectContentScript(signal: AbortSignal) {
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))
}
