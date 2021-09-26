/**
 * Prefer function declaration than const f = () => ...
 * in this file please.
 */
import { WALLET_OR_PERSONA_NAME_MAX_LEN } from './constants'
import { pasteImage } from '@masknet/injected-script'

import { isNull, noop } from 'lodash-es'

export { timeout, delay } from '@masknet/shared'
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
 * paste image to activeElements
 * @param image
 */
export async function pasteImageToActiveElements(image: File | Blob): Promise<void> {
    pasteImage(new Uint8Array(await blobToArrayBuffer(image)))
}

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

/**
 * index starts at one.
 */
export function regexMatch(str: string, regexp: RegExp, index?: number): string | null
export function regexMatch(str: string, regexp: RegExp, index: null): RegExpMatchArray | null
export function regexMatch(str: string, regexp: RegExp, index: number | null = 1) {
    const r = str.match(regexp)
    if (isNull(r)) return null
    if (index === null) {
        return r as RegExpMatchArray as any
    }
    return r[index] as string as any
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

export function addUint8Array(a: ArrayBuffer, b: ArrayBuffer) {
    const x = new Uint8Array(a)
    const y = new Uint8Array(b)
    const c = new Uint8Array(x.length + y.length)
    c.set(x)
    c.set(y, x.length)
    return c
}

import Services from '../extension/service'
import { blobToArrayBuffer } from '@dimensiondev/kit'
export { parseURL } from '@masknet/shared'
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
    for (let i = 0; i < hex_.length; i += 2) buf.push(Number.parseInt(hex_.substr(i, 2), 16))
    return new Uint8Array(buf)
}

export function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
    if (!x) throw new Error('Assert failed!')
}

export function checkInputLengthExceed(name: string) {
    return name.length >= WALLET_OR_PERSONA_NAME_MAX_LEN
}

export function nonNullable<T>(x: undefined | null | T): x is T {
    return x !== undefined && x !== null
}
