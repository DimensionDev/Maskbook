import { Flags } from '../../../shared/flags'
import { fetchInjectContentScriptList, contentScriptURL, injectedScriptURL, maskSDK_URL } from './InjectContentScripts'
type Args = browser.webNavigation.TransitionNavListener extends browser.webNavigation.NavListener<infer U> ? U : never
export default function (signal: AbortSignal) {
    const injectContentScript = fetchInjectContentScriptList(contentScriptURL)

    // TODO: after we can register a declarative style of MAIN script, we should move to the scripting.registerContentScripts and new MAIN script register API.
    async function onCommittedListener(arg: Args): Promise<void> {
        if (arg.url === 'about:blank') return
        if (!arg.url.startsWith('http')) return

        // This option is conflict with MV3.
        if (Flags.support_declarative_user_script) return

        const contains = await browser.permissions.contains({ origins: [arg.url] })
        if (!contains) return

        chrome.scripting.executeScript({
            files: [injectedScriptURL, maskSDK_URL],
            target: { tabId: arg.tabId, frameIds: [arg.frameId] },
            world: 'MAIN',
        })

        chrome.scripting.executeScript({
            files: await injectContentScript,
            target: { tabId: arg.tabId, frameIds: [arg.frameId] },
            world: 'ISOLATED',
        })
    }
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))
}

// https://developer.chrome.com/docs/extensions/reference/scripting/
declare namespace chrome {
    namespace scripting {
        export function executeScript(injection: ScriptInjectionFiles, callback?: () => void): Promise<void>
        export function executeScript<F extends any[], R>(
            injection: ScriptInjectionFunction<F, R>,
            callback?: (val: R) => void,
        ): Promise<R>
        export function registerContentScripts(scripts: RegisteredContentScript[], callback?: () => void): void
        export interface RegisteredContentScript {
            allFrames?: boolean
            css?: string[]
            excludeMatches?: string[]
            id: string
            js?: string[]
            matches?: string[]
            persistAcrossSessions?: boolean
            runAt?: 'document_start' | 'document_end' | 'document_idle'
        }
        export interface InjectionTarget {
            allFrames?: boolean
            frameIds?: number[]
            tabId: number
        }
        export interface ScriptInjectionFiles {
            files: string[]
            target: InjectionTarget
            world?: 'ISOLATED' | 'MAIN'
        }
        export interface ScriptInjectionFunction<F extends any[], R> {
            args?: F
            func?: (...args: F) => R
            target: InjectionTarget
            world?: 'ISOLATED' | 'MAIN'
        }
    }
}
