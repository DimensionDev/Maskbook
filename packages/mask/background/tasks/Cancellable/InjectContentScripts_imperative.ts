import { hmr } from '../../../utils-pure/hmr.js'
import type { WebNavigation } from 'webextension-polyfill'
import { evaluateContentScript, ignoreInjectError, injectedScriptURL, maskSDK_URL } from '../../utils/injectScript.js'
import { Sniffings } from '@masknet/shared-base'
import { matchesAnySiteAdaptor } from '../../../shared/site-adaptors/definitions.js'

const { signal } = hmr(import.meta.webpackHot)
if (browser.scripting?.registerContentScripts === undefined) InjectContentScript(signal)

async function onCommittedListener(arg: WebNavigation.OnCommittedDetailsType): Promise<void> {
    if (!arg.url.startsWith('http')) return
    const contains = await browser.permissions.contains({ origins: [arg.url] })
    if (!contains) return

    const err = ignoreInjectError(arg)

    const executeScript = (files: string[]) => {
        const script = {
            target: { tabId: arg.tabId, frameIds: [arg.frameId] },
            files,
            world: 'MAIN' as any,
            injectImmediately: true,
        }
        if (Sniffings.is_firefox) delete script.world
        return browser.scripting.executeScript(script)
    }

    if (matchesAnySiteAdaptor(arg.url)) {
        // don't add await here. we don't want this to block the content script
        executeScript([injectedScriptURL]).catch(err)
    }
    executeScript([maskSDK_URL]).catch(err)

    evaluateContentScript(arg.tabId, arg.frameId).catch(err)
}
async function InjectContentScript(signal: AbortSignal) {
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))
}
