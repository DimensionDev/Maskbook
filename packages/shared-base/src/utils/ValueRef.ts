import { defer } from '@masknet/kit'
import { isEqual } from 'lodash-es'
import { EMPTY_LIST, EMPTY_OBJECT } from '../Pure/index.js'
import stringify from 'json-stable-stringify'

export type ValueComparer<T> = (a: T, b: T) => boolean
const defaultComparer: ValueComparer<any> = (a, b) => a === b
export class ValueRef<T> {
    constructor(value: T, isEqual: ValueComparer<T> = defaultComparer) {
        this._value = value
        this._ssrValue = value
        this.isEqual = isEqual
    }
    get value() {
        return this._value
    }
    set value(newVal: T) {
        const oldVal = this._value
        if (this.isEqual(newVal, oldVal)) return
        this._value = newVal
        for (const fn of this.watcher) {
            try {
                fn(newVal, oldVal)
            } catch (err) {
                console.error(err)
            }
        }
    }
    addListener(fn: (newVal: T, oldVal: T) => void): () => void {
        this.watcher.add(fn)
        return () => void this.watcher.delete(fn)
    }
    setServerSnapshot(value: T): void {
        if (this.hasSSRValue) {
            if (this.isEqual(this._ssrValue, value)) return
            throw new Error('Cannot change the server side snapshot')
        }
        this.hasSSRValue = true
        this._ssrValue = value
    }
    getServerSnapshot(): T {
        return this._ssrValue
    }
    private watcher = new Set<(newVal: any, oldVal: any) => void>()
    private isEqual: ValueComparer<T>
    private _value: T
    private hasSSRValue = false
    private _ssrValue: T
}

export class ValueRefWithReady<T> extends ValueRef<T> {
    constructor(value?: T | undefined, isEqual: ValueComparer<T> = defaultComparer) {
        // this is unsafe. we assigned T | undefined to T
        super(value!, isEqual)
        const [promise, resolve] = defer<void>()
        this.readyPromise = promise.then(() => this.value)
        this.nowReady = resolve
    }
    override get value() {
        return super.value
    }
    override set value(value: T) {
        if (this.ready === false) {
            this.nowReady!()
            Object.assign(this, { ready: true, nowReady: undefined })
        }
        super.value = value
    }
    readonly nowReady: (() => void) | undefined
    readonly ready = false
    readonly readyPromise: Promise<T>
}

/**
 * @deprecated
 * Avoid using this. You should define a comparer to use the object directly.
 * This class is provided to strongly type the existing bad-smell code.
 */
export class ValueRefJSON<T extends object> extends ValueRefWithReady<string> {
    constructor(defaultValue: T) {
        super(stringify(defaultValue), isEqual)
    }
    override get value(): string {
        return super.value
    }
    override set value(value: T | Readonly<T> | string) {
        if (typeof value === 'string') {
            super.value = value
            return
        }
        if (isEqual(this.asJSON, value)) return
        this.json = value
        super.value = stringify(value)
    }
    private json: Readonly<T> | undefined
    get asJSON(): Readonly<T> {
        if (this.json) return this.json
        if (this.value === '[]') return (this.json = EMPTY_LIST as any)
        if (this.value === '{}') return (this.json = EMPTY_OBJECT as any)
        return (this.json = JSON.parse(this.value))
    }
}
