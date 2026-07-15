// All imports must be deferred. This file loads in the very early stage.

export type ValueComparer<T> = (a: T, b: T) => boolean
const defaultComparer: ValueComparer<any> = (a, b) => a === b
export class ValueRef<T> {
    constructor(value: T, isEqual: ValueComparer<T> = defaultComparer) {
        this.#value = value
        this.#isEqual = isEqual
    }
    get value() {
        return this.#value
    }
    set value(newVal: T) {
        const oldVal = this.#value
        if (this.#isEqual(newVal, oldVal)) return
        this.#value = newVal
        for (const fn of this.#watcher) {
            try {
                fn(newVal, oldVal)
            } catch (err) {
                console.error(err)
            }
        }
    }
    addListener(fn: (newVal: T, oldVal: T) => void): () => void {
        this.#watcher.add(fn)
        return () => void this.#watcher.delete(fn)
    }
    #watcher = new Set<(newVal: any, oldVal: any) => void>()
    #isEqual: ValueComparer<T>
    #value: T
}

export class ValueRefWithReady<T> extends ValueRef<T> {
    constructor(value?: T, isEqual: ValueComparer<T> = defaultComparer) {
        // this is unsafe. we assigned T | undefined to T
        super(value!, isEqual)
        const { promise, resolve } = Promise.withResolvers<void>()
        this.readyPromise = promise.then(() => this.value)
        this.#nowReady = resolve
    }

    override get value() {
        return super.value
    }
    override set value(value: T) {
        if (!this.ready) {
            this.#nowReady!()
            this.#ready = true
            this.#nowReady = undefined
        }
        super.value = value
    }

    #nowReady: (() => void) | undefined
    get nowReady() {
        return this.#nowReady
    }

    #ready = false
    get ready() {
        return this.#ready
    }

    readonly readyPromise: Promise<T>
}
