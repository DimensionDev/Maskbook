import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'
import { hmr } from '../../../utils-pure/index.js'
import {
    fetchInjectContentScriptList,
    contentScriptURL,
    injectedScriptURL,
    maskSDK_URL,
} from './InjectContentScripts_imperative.js'
import type { Scripting } from 'webextension-polyfill'

const { signal } = hmr(import.meta.webpackHot)
if (typeof browser.scripting?.registerContentScripts === 'function') {
    await unregisterExistingScripts()
    await browser.scripting.registerContentScripts([
        ...prepareMainWorldScript(['<all_urls>']),
        ...(await prepareContentScript(['<all_urls>'])),
    ])

    signal.addEventListener('abort', unregisterExistingScripts)
}

async function unregisterExistingScripts() {
    await browser.scripting.unregisterContentScripts().catch(noop)
}

function prepareMainWorldScript(matches: string[]): Scripting.RegisteredContentScript[] {
    if (Flags.has_firefox_xray_vision) return []

    const result: Scripting.RegisteredContentScript = {
        id: 'injected',
        allFrames: true,
        js: [injectedScriptURL],
        persistAcrossSessions: false,
        // @ts-expect-error Chrome API
        world: 'MAIN',
        runAt: 'document_start',
        matches,
    }
    if (Flags.mask_SDK_ready) result.js!.push(maskSDK_URL)
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
    if (Flags.mask_SDK_ready) xrayScript.js!.push(maskSDK_URL)

    const content: Scripting.RegisteredContentScript = {
        id: 'content',
        allFrames: true,
        js: await fetchInjectContentScriptList(contentScriptURL),
        persistAcrossSessions: false,
        // @ts-expect-error Chrome API
        world: 'ISOLATED',
        runAt: 'document_idle',
        matches,
    }
    if (Flags.has_firefox_xray_vision) return [xrayScript, content]
    return [content]
}
