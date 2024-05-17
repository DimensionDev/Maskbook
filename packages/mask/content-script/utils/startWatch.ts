import type { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Flags } from '@masknet/flags'

/**
 * @example
 * ```ts
 * startWatch(new MutationObserverWatcher(ls), {
 *    signal,
 *    missingReportRule: new URL('https://x.com/'),
 *    name: 'twitter-home-page',
 * })
 * ```
 *
 * This will be reported only when the current page is https://x.com/ and no matches is found.
 */
export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(watcher: T, options: WatchOptions): T
export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(watcher: T, options: AbortSignal): T
export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(
    watcher: T,
    options: AbortSignal | WatchOptions,
) {
    if (options instanceof AbortSignal) {
        options = { signal: options }
    }
    const { signal, missingReportRule, shadowRootDelegatesFocus: delegatesFocus } = options

    if (missingReportRule) {
        watchers.set(watcher, missingReportRule)
        const timeout = setTimeout(check, 2000)
        signal.addEventListener(
            'abort',
            () => {
                watchers.delete(watcher)
                clearTimeout(timeout)
            },
            { once: true },
        )
    }

    watcher
        .setDOMProxyOption({
            afterShadowRootInit: { ...Flags.shadowRootInit, delegatesFocus },
            beforeShadowRootInit: { ...Flags.shadowRootInit, delegatesFocus },
        })
        .startWatch({ subtree: true, childList: true }, signal)
    return watcher
}
/**
 * string will be startsWith match, RegExp will be partial match
 */
type MissingReportRuleBasic = string | RegExp
type MissingReportRule = MissingReportRuleBasic | MissingReportRuleBasic[] | (() => boolean | Promise<boolean>)

interface MissingReportRuleOptions {
    name: string
    rule: MissingReportRule
}

export interface WatchOptions {
    signal: AbortSignal
    missingReportRule?: MissingReportRuleOptions
    shadowRootDelegatesFocus?: boolean
}

const watchers = new Map<MutationObserverWatcher<any>, MissingReportRuleOptions>()
if (typeof window === 'object') {
    window.addEventListener('locationchange', () => {
        setTimeout(check, 2000)
    })
}
let reporter: (name: string) => void = function (name: string) {
    console.warn(`[Mask] Watcher "${name}" expected to match something but it didn't.`, location.href)
}
export function configureSelectorMissReporter(newReporter: typeof reporter) {
    reporter = newReporter
}
function check() {
    for (const [watcher, { name, rule }] of watchers) {
        // protected API
        // eslint-disable-next-line @typescript-eslint/dot-notation
        if (watcher['lastKeyList'].length) continue
        if (typeof rule === 'function') {
            const result = rule()
            if (!result) continue
            if (result !== true) {
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                result.then((x) => x || reporter(name))
                continue
            }
        } else if (Array.isArray(rule)) {
            if (!rule.some(hitBasic)) continue
        } else if (!hitBasic(rule)) continue

        reporter(name)
    }
}
function hitBasic(rule: MissingReportRuleBasic) {
    if (rule instanceof RegExp) {
        return rule.test(location.href)
    }
    return location.href.startsWith(rule)
}
