import { Db } from 'typed-db'
import { Newable } from 'typed-db/dist-release/src/db/Db'
import { Store } from 'typed-db/dist-release/src/db/Store'
import 'reflect-metadata'
import { CustomEventId } from './constants'
import { CustomEvents } from '../extension/injected-script/addEventListener'

export { sleep, timeout } from '@holoflows/kit/es/util/sleep'
/** Build a db */
export const buildQuery = <Q extends Newable<any>>(db: Db, record: Q) => {
    db.use(record)
    return <T>(
        cb: (tx: Store<InstanceType<Q>>) => Promise<T extends any[] ? T : T | undefined> | void,
        mode: 'readonly' | 'readwrite' = 'readonly',
    ) => db.transaction([record], mode, t => cb(t.for(record)))
}

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
    document.dispatchEvent(new CustomEvent(CustomEventId, { detail: [event, x] }))
}
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
