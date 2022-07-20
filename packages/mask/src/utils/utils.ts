/**
 * Prefer function declaration than const f = () => ...
 * in this file please.
 */
import { pasteImage } from '@masknet/injected-script'
import type { NextIDPersonaBindings } from '@masknet/shared-base'
import { first, isNull } from 'lodash-unified'

/**
 * Download given url return as Blob
 */
export async function downloadUrl(url: string) {
    try {
        if (url.startsWith(browser.runtime.getURL(''))) {
            const response = await globalThis.r2d2Fetch(url)
            return response.blob()
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
    pasteImage(new Uint8Array(await image.arrayBuffer()))
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

/**
 * index starts at one.
 */
export function regexMatch(input: string, pattern: RegExp, index?: number): string | null
export function regexMatch(input: string, pattern: RegExp, index: null): RegExpMatchArray | null
export function regexMatch(input: string, pattern: RegExp, index: number | null = 1) {
    const r = input.match(pattern)
    if (isNull(r)) return null
    if (index === null) {
        return r as RegExpMatchArray as any
    }
    return r[index] as string as any
}
/**
 *
 * @param find latest used persona binding
 */

export const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId: string): number => {
    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.created_at > p_b.created_at) return -1
    return 1
}
