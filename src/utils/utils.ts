import { Db } from 'typed-db'
import { Newable } from 'typed-db/dist-release/src/db/Db'
import { Store } from 'typed-db/dist-release/src/db/Store'
import 'reflect-metadata'

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
