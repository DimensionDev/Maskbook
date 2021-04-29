import { Emitter } from '@servie/events'
export { ALL_EVENTS } from '@servie/events'
// Consider switch to libraries like Mobx if this file become too complex.
export class ObservableWeakMap<K extends object, V> extends WeakMap<K, V> {
    declare __brand: 'Map'

    event = new Emitter<{ delete: [K]; set: [K, V] }>()
    delete(key: K) {
        const _ = super.delete(key)
        this.event.emit('delete', key)
        return _
    }
    set(key: K, value: V) {
        const _ = super.set(key, value)
        this.event.emit('set', key, value)
        return _
    }
}
export class ObservableMap<K, V> extends Map<K, V> {
    declare __brand: 'Map'

    event = new Emitter<{ delete: [K]; set: [K, V]; clear: [] }>()
    clear() {
        super.clear()
        this.event.emit('clear')
    }
    delete(key: K) {
        const _ = super.delete(key)
        this.event.emit('delete', key)
        return _
    }
    set(key: K, value: V) {
        const _ = super.set(key, value)
        this.event.emit('set', key, value)
        return _
    }
}
export class ObservableSet<T> extends Set<T> {
    declare __brand: 'ObservableSet'

    event = new Emitter<{ delete: [T]; add: [T[]]; clear: [] }>()
    clear() {
        super.clear()
        this.event.emit('clear')
    }
    delete(key: T) {
        const _ = super.delete(key)
        this.event.emit('delete', key)
        return _
    }
    add(...value: T[]) {
        value.forEach((x) => super.add(x))
        this.event.emit('add', value)
        return this
    }
}
