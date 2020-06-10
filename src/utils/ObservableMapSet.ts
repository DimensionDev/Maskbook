// Consider switch to libraries like Mobx if this file become too complex.
export class ObservableWeakMap<K extends object, V> extends WeakMap<K, V> {
    declare __brand: 'Map'
    declare onDelete?: (key: K) => void
    delete(key: K) {
        this.onDelete?.(key)
        return super.delete(key)
    }
    declare onSet?: (key: K, value: V) => void
    set(key: K, value: V) {
        this.onSet?.(key, value)
        return super.set(key, value)
    }
}
export class ObservableMap<K, V> extends Map<K, V> {
    declare __brand: 'Map'
    declare onClear?: () => void
    clear() {
        this.onClear?.()
        super.clear()
    }
    declare onDelete?: (key: K) => void
    delete(key: K) {
        this.onDelete?.(key)
        return super.delete(key)
    }
    declare onSet?: (key: K, value: V) => void
    set(key: K, value: V) {
        this.onSet?.(key, value)
        return super.set(key, value)
    }
}
export class ObservableSet<T> extends Set<T> {
    declare __brand: 'ObservableSet'
    declare onClear?: () => void
    clear() {
        this.onClear?.()
        super.clear()
    }
    declare onDelete?: (value: T) => void
    delete(value: T) {
        this.onDelete?.(value)
        return super.delete(value)
    }
    declare onAdd?: (value: T) => void
    add(value: T) {
        this.onAdd?.(value)
        return super.add(value)
    }
}
