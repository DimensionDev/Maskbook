import 'reflect-metadata'
import { CustomEventId } from './constants'
import { CustomEvents } from '../extension/injected-script/addEventListener'

import { sleep as _sleep, timeout as _timeout } from '@holoflows/kit/es/util/sleep'
import { isNull } from 'lodash-es'

export const sleep = _sleep
export const timeout = _timeout

/**
 * Get reference of file in both extension and storybook
 */
export function getUrl(path: string, fallback: string = '') {
    if (typeof browser === 'object' && browser.runtime && browser.runtime.getURL) {
        return browser.runtime.getURL(path)
    }
    return fallback || path
}

/**
 * Dispatch a fake event.
 * @param event Event name
 * @param x parameters
 */
export function dispatchCustomEvents<T extends keyof CustomEvents>(event: T, ...x: CustomEvents[T]) {
    document.dispatchEvent(new CustomEvent(CustomEventId, { detail: JSON.stringify([event, x]) }))
}

Object.assign(window, { dispatchCustomEvents })

/**
 * Select all text in a node
 * @param el Element
 */
export function selectElementContents(el: Node) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
}

export function untilDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise(resolve => {
        document.addEventListener('readystatechange', resolve, { once: true, passive: true })
    })
}

export const nop: (...args: any[]) => any = () => {};

export const regexMatch = (str: string, regexp: RegExp, index: number) => {
    const r = str.match(regexp)
    if (isNull(r)) return null
    return r[index]
}
