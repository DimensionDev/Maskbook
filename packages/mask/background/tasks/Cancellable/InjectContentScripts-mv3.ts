import { noop } from 'lodash-unified'
import { Flags } from '../../../shared/flags'
import { fetchInjectContentScriptList, contentScriptURL, injectedScriptURL, maskSDK_URL } from './InjectContentScripts'
type Args = browser.webNavigation.TransitionNavListener extends browser.webNavigation.NavListener<infer U> ? U : never
export default function (signal: AbortSignal) {
    if (Flags.use_register_content_script) NewImplementation(signal)
    else OldImplementation(signal)
}

function OldImplementation(signal: AbortSignal) {
    const injectContentScript = fetchInjectContentScriptList(contentScriptURL)

    async function onCommittedListener(arg: Args): Promise<void> {
        if (arg.url === 'about:blank') return
        if (!arg.url.startsWith('http')) return

        // This option is conflict with MV3.
        if (Flags.support_declarative_user_script) return

        const contains = await browser.permissions.contains({ origins: [arg.url] })
        if (!contains) return

        browser.scripting.executeScript({
            files: [injectedScriptURL, maskSDK_URL],
            target: { tabId: arg.tabId, frameIds: [arg.frameId] },
            world: 'MAIN',
        })

        browser.scripting.executeScript({
            files: await injectContentScript,
            target: { tabId: arg.tabId, frameIds: [arg.frameId] },
            world: 'ISOLATED',
        })
    }
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))
}

async function NewImplementation(signal: AbortSignal) {
    await unregisterExistingScripts()
    await browser.scripting.registerContentScripts([
        ...prepareMainWorldScript(['<all_urls>']),
        ...(await prepareContentScript(['<all_urls>'])),
    ])

    signal.addEventListener('abort', unregisterExistingScripts)
}
async function unregisterExistingScripts() {
    await browser.scripting
        .unregisterContentScripts({
            ids: (await browser.scripting.getRegisteredContentScripts()).map((x) => x.id),
        })
        .catch(noop)
}

function prepareMainWorldScript(matches: string[]): browser.scripting.RegisteredContentScript[] {
    if (Flags.support_declarative_user_script) return []
    if (Flags.has_firefox_xray_vision) return []

    const result: browser.scripting.RegisteredContentScript = {
        id: 'injected',
        allFrames: true,
        js: [injectedScriptURL],
        persistAcrossSessions: false,
        world: 'MAIN',
        runAt: 'document_start',
        matches,
    }
    if (Flags.mask_SDK_ready) result.js!.push(maskSDK_URL)
    return [result]
}

async function prepareContentScript(matches: string[]): Promise<browser.scripting.RegisteredContentScript[]> {
    const xrayScript: browser.scripting.RegisteredContentScript = {
        id: 'xray',
        allFrames: true,
        js: [injectedScriptURL],
        persistAcrossSessions: false,
        world: 'ISOLATED',
        runAt: 'document_start',
        matches,
    }
    if (Flags.mask_SDK_ready) xrayScript.js!.push(maskSDK_URL)

    const content: browser.scripting.RegisteredContentScript = {
        id: 'content',
        allFrames: true,
        js: await fetchInjectContentScriptList(contentScriptURL),
        persistAcrossSessions: false,
        world: 'ISOLATED',
        runAt: 'document_idle',
        matches,
    }
    if (Flags.has_firefox_xray_vision && !Flags.support_declarative_user_script) return [xrayScript, content]
    return [content]
}
