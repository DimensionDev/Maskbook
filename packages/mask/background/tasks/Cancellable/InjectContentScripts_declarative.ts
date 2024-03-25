import { noop } from 'lodash-es'
import { hmr } from '../../../utils-pure/index.js'
import type { Scripting } from 'webextension-polyfill'
import { injectedScriptURL, fetchInjectContentScriptList, maskSDK_URL } from '../../utils/injectScript.js'
import { Sniffings } from '@masknet/shared-base'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions.js'

const { signal } = hmr(import.meta.webpackHot)
if (typeof browser.scripting?.registerContentScripts === 'function') {
    ;(async () => {
        await unregisterExistingScripts()
        await browser.scripting.registerContentScripts([
            ...prepareMainWorldScript('sdk', ['<all_urls>'], maskSDK_URL),
            ...prepareMainWorldScript(
                'script',
                Array.from(definedSiteAdaptors.values(), (x) => x.declarativePermissions.origins).flat(),
                injectedScriptURL,
            ),
            ...(await prepareContentScript(['<all_urls>'])),
        ])
    })()
    signal.addEventListener('abort', unregisterExistingScripts)
}

async function unregisterExistingScripts() {
    await browser.scripting.unregisterContentScripts().catch(noop)
}

function prepareMainWorldScript(name: string, matches: string[], url: string): Scripting.RegisteredContentScript[] {
    if (Sniffings.is_firefox) return []
    const result: Scripting.RegisteredContentScript = {
        id: 'injected_' + name,
        allFrames: true,
        js: [url],
        persistAcrossSessions: false,
        // @ts-expect-error Chrome API
        world: 'MAIN',
        runAt: 'document_start',
        matches,
    }
    return [result]
}

async function prepareContentScript(matches: string[]): Promise<Scripting.RegisteredContentScript[]> {
    const xrayScript: Scripting.RegisteredContentScript = {
        id: 'xray',
        allFrames: true,
        js: [injectedScriptURL],
        persistAcrossSessions: false,
        // @ts-expect-error Chrome API
        world: 'ISOLATED',
        runAt: 'document_start',
        matches,
    }
    const content: Scripting.RegisteredContentScript = {
        id: 'content',
        allFrames: true,
        js: await fetchInjectContentScriptList(),
        persistAcrossSessions: false,
        // @ts-expect-error Chrome API
        world: 'ISOLATED',
        runAt: 'document_idle',
        matches,
    }
    if (globalThis.navigator?.userAgent.includes('Firefox')) return [xrayScript, content]
    return [content]
}
