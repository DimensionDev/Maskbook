/// <reference types="web-ext-types" />
declare namespace browser.storage {
    const session: StorageArea
}

// https://developer.chrome.com/docs/extensions/reference/scripting/
declare namespace browser {
    declare namespace scripting {
        export function executeScript(injection: ScriptInjectionFiles): Promise<void>
        export function executeScript<F extends any[], R>(injection: ScriptInjectionFunction<F, R>): Promise<R>
        export function registerContentScripts(scripts: RegisteredContentScript[]): Promise<void>
        export function unregisterContentScripts(filter?: ContentScriptFilter): Promise<void>
        export function getRegisteredContentScripts(filter?: ContentScriptFilter): Promise<RegisteredContentScript[]>
        export interface ContentScriptFilter {
            ids?: string[]
        }
        export interface RegisteredContentScript {
            allFrames?: boolean
            css?: string[]
            excludeMatches?: string[]
            id: string
            js?: string[]
            matches?: string[]
            persistAcrossSessions?: boolean
            runAt?: 'document_start' | 'document_end' | 'document_idle'
            world?: 'ISOLATED' | 'MAIN'
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
