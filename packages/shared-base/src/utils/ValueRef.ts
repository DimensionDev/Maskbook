export class ValueRef<T> {
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
    private watcher = new Set<(newVal: any, oldVal: any) => void>()
    public isEqual: (a: unknown, b: unknown) => boolean
    constructor(private _value: T, isEqual: (a: T, b: T) => boolean = (a, b) => a === b) {
        this.isEqual = isEqual as any
    }
    addListener(fn: (newVal: T, oldVal: T) => void): () => void {
        this.watcher.add(fn)
        return () => void this.watcher.delete(fn)
    }
    removeListener(fn: (newVal: T, oldVal: T) => void) {
        this.watcher.delete(fn)
    }
}
