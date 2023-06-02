/**
 * Prefer function declaration than const f = () => ...
 * in this file please.
 */
import { isNull } from 'lodash-es'
import { pasteImage } from '@masknet/injected-script'
import Services from '../extension/service.js'
import { ProfileIdentifier, type ProfileInformationFromNextID } from '@masknet/shared-base'
import { batch, notify } from 'async-call-rpc'
/**
 * Download given url return as Blob
 */
export async function downloadUrl(url: string) {
    try {
        if (url.startsWith(browser.runtime.getURL(''))) {
            return Services.Helper.fetchBlob(url)
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
        return r as any
    }
    return r[index]
}

export async function attachNextIDToProfile(nextID: ProfileInformationFromNextID) {
    const whoAmI = await Services.Settings.getCurrentPersonaIdentifier()

    if (!nextID?.fromNextID || !nextID.linkedPersona || !whoAmI) return
    const [rpc, emit] = batch(notify(Services.Identity))
    nextID.linkedTwitterNames?.forEach((x) => {
        const newItem = {
            ...nextID,
            nickname: x,
            identifier: ProfileIdentifier.of('twitter.com', x).expect(`${x} should be a valid user id`),
        }
        rpc.attachNextIDPersonaToProfile(newItem, whoAmI)
    })
    emit()
}
