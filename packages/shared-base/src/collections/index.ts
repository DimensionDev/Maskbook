import { Emitter } from '@servie/events'
export { ALL_EVENTS } from '@servie/events'
// Consider switch to libraries like Mobx if this file become too complex.
export class ObservableWeakMap<K extends object, V> extends WeakMap<K, V> {
    declare __brand: 'Map'

    event = new Emitter<{ delete: [K]; set: [K, V] }>()
    override delete(key: K) {
        const _ = super.delete(key)
        this.event.emit('delete', key)
        return _
    }
    override set(key: K, value: V) {
        const _ = super.set(key, value)
        this.event.emit('set', key, value)
        return _
    }
}
export class ObservableMap<K, V> extends Map<K, V> {
    declare __brand: 'Map'

    event = new Emitter<{ delete: [K]; set: [K, V]; clear: [] }>()
    override clear() {
        super.clear()
        this.event.emit('clear')
    }
    override delete(key: K) {
        const _ = super.delete(key)
        this.event.emit('delete', key)
        return _
    }
    override set(key: K, value: V) {
        const _ = super.set(key, value)
        this.event.emit('set', key, value)
        return _
    }
}
export class ObservableSet<T> extends Set<T> {
    declare __brand: 'ObservableSet'

    event = new Emitter<{ delete: [T]; add: [T[]]; clear: [] }>()
    override clear() {
        super.clear()
        this.event.emit('clear')
    }
    override delete(key: T) {
        const _ = super.delete(key)
        this.event.emit('delete', key)
        return _
    }
    override add(...value: T[]) {
        value.forEach((x) => super.add(x))
        this.event.emit('add', value)
        return this
    }
}
