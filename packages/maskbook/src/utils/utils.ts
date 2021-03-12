/**
 * Prefer function declaration than const f = () => ...
 * in this file please.
 */
import { CustomEventId, WALLET_OR_PERSONA_NAME_MAX_LEN } from './constants'
import type { CustomEvents } from '../extension/injected-script/CustomEvents'

import { isNull, noop } from 'lodash-es'

/**
 * Return a promise that resolved after `time` ms.
 * If `time` is `Infinity`, it will never resolve.
 * @param time - Time to sleep. In `ms`.
 */
export function delay(time: number) {
    return new Promise<void>((resolve) => (Number.isFinite(time) ? setTimeout(resolve, time) : void 0))
}

/**
 * Accept a promise and then set a timeout on it. After `time` ms, it will reject.
 * @param promise - The promise that you want to set time limit on.
 * @param time - Time before timeout. In `ms`.
 * @param rejectReason - When reject, show a reason. Defaults to `"timeout"`
 */
export function timeout<T>(promise: PromiseLike<T>, time: number, rejectReason?: string): Promise<T> {
    if (!Number.isFinite(time)) return (async () => promise)()
    let timer: any
    const race = Promise.race([
        promise,
        new Promise<T>((r, reject) => {
            timer = setTimeout(() => reject(new Error(rejectReason ?? 'timeout')), time)
        }),
    ])
    race.finally(() => clearTimeout(timer))
    return race
}

/**
 * Download given url return as Blob
 */
export async function downloadUrl(url: string) {
    try {
        if (url.startsWith(browser.runtime.getURL(''))) {
            return Services.Helper.fetch(url)
        }
    } catch {}
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch failed.')
    return res.blob()
}

/**
 * Dispatch a fake event.
 * @param element The event target
 * @param event Event name
 * @param x parameters
 */
export function dispatchCustomEvents<T extends keyof CustomEvents>(
    element: Element | Document | null = document,
    event: T,
    ...x: CustomEvents[T]
) {
    document.dispatchEvent(new CustomEvent(CustomEventId, { detail: JSON.stringify([event, x]) }))
}

/**
 * paste image to activeElements
 * @param image
 */
export async function pasteImageToActiveElements(image: File | Blob): Promise<void> {
    const bytes = new Uint8Array(await image.arrayBuffer())
    dispatchCustomEvents(document.activeElement, 'paste', { type: 'image', value: Array.from(bytes) })
}

Object.assign(globalThis, { dispatchCustomEvents })

/**
 * Select all text in a node
 * @param el Element
 */
export function selectElementContents(el: Node) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = globalThis.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    return sel
}

export function nopWithUnmount(..._args: unknown[]) {
    return noop
}
export function unreachable(val: never): never {
    console.error('Unhandled value: ', val)
    throw new Error('Unreachable case:' + val)
}
export function safeUnreachable(val: never) {
    console.error('Unhandled value: ', val)
}
/**
 * index starts at one.
 */
export function regexMatch(str: string, regexp: RegExp, index?: number): string | null
export function regexMatch(str: string, regexp: RegExp, index: null): RegExpMatchArray | null
export function regexMatch(str: string, regexp: RegExp, index: number | null = 1) {
    const r = str.match(regexp)
    if (isNull(r)) return null
    if (index === null) {
        return (r as RegExpMatchArray) as any
    }
    return (r[index] as string) as any
}

/**
 * enables you to use match group with flag g
 *
 * @return
 *  if no matches, return null;
 *  return target match group in each matches;
 *
 * @example
 *  regexMatchAll(">target<whatever>target2<", />(.+)</)
 *  >>> ["target", "target2"]
 */
export function regexMatchAll(str: string, regexp: RegExp, index: number = 1) {
    const gPos = regexp.flags.indexOf('g')
    const withoutG = gPos >= 0 ? `${regexp.flags.slice(0, gPos)}${regexp.flags.slice(gPos + 1)}` : regexp.flags
    const o = new RegExp(regexp.source, withoutG)
    const g = new RegExp(regexp.source, `${withoutG}g`)
    const r = str.match(g)
    if (isNull(r)) {
        return null
    }
    const sto = []
    for (const v of r) {
        const retV = v.match(o)
        if (isNull(retV)) {
            continue
        }
        sto.push(retV[index])
    }
    if (sto.length === 0) {
        return null
    }
    return sto
}

/**
 * batch run string.replace
 * @param source    the source string to replace
 * @param group     Array of find-replace pair,
 *                  each pair same as the param of
 *                  string.replace
 * @return          result string
 */
export function batchReplace(source: string, group: Array<[string | RegExp, string]>) {
    let storage = source
    for (const v of group) {
        storage = storage.replace(v[0], v[1])
    }
    return storage
}

export function pollingTask(
    task: () => Promise<boolean>,
    {
        delay = 30 * 1000,
    }: {
        delay?: number
    } = {},
) {
    let canceled = false
    let timer: NodeJS.Timeout
    const runTask = async () => {
        if (canceled) return
        let stop = false
        try {
            stop = await task()
        } catch (e) {
            console.error(e)
        }
        if (!stop) timer = setTimeout(runTask, delay)
    }
    runTask()
    return {
        cancel: () => (canceled = true),
        reset: () => {
            clearTimeout(timer)
            timer = setTimeout(runTask, delay)
        },
    }
}
export function addUint8Array(a: ArrayBuffer, b: ArrayBuffer) {
    const x = new Uint8Array(a)
    const y = new Uint8Array(b)
    const c = new Uint8Array(x.length + y.length)
    c.set(x)
    c.set(y, x.length)
    return c
}

import anchorme from 'anchorme'
import Services from '../extension/service'
export function parseURL(string: string) {
    return anchorme.list(string).map((x) => x.string)
}
/**
 * !!!! Please use the Promise constructor if possible
 * If you don't understand https://groups.google.com/forum/#!topic/bluebird-js/mUiX2-vXW2s
 */
export function defer<T, E = unknown>() {
    let a!: (val: T) => void, b!: (err: E) => void
    const p = new Promise<T>((x, y) => {
        a = x
        b = y
    })
    return [p, a, b] as const
}

export function buf2hex(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('')
}

export function hex2buf(hex: string) {
    let hex_ = hex
    hex_ = hex.replace(/^0x/, '') // strip 0x
    if (hex_.length % 2) hex_ = `0${hex_}` // pad even zero
    const buf = []
    for (let i = 0; i < hex_.length; i += 2) buf.push(parseInt(hex_.substr(i, 2), 16))
    return new Uint8Array(buf)
}

export function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
    if (!x) throw new Error('Assert failed!')
}

export function checkInputLengthExceed(name: string) {
    return Array.from(name).length >= WALLET_OR_PERSONA_NAME_MAX_LEN
}
