import { Emitter, ALL_EVENTS } from '@servie/events'
import { EMPTY_LIST } from '../constants.js'

function tick(callback: () => void) {
    Promise.resolve().then(callback)
}

export class ObservableWeakMap<K extends object, V> extends WeakMap<K, V> {
    readonly ALL_EVENTS: typeof ALL_EVENTS = ALL_EVENTS

    declare __brand: 'Map'

    event = new Emitter<{ delete: [K]; set: [K, V]; [ALL_EVENTS]: [] }>()
    override delete(key: K) {
        const _ = super.delete(key)
        tick(() => this.event.emit('delete', key))
        return _
    }
    override set(key: K, value: V) {
        const _ = super.set(key, value)
        tick(() => this.event.emit('set', key, value))
        return _
    }
}
export class ObservableMap<K, V> extends Map<K, V> {
    readonly ALL_EVENTS: typeof ALL_EVENTS = ALL_EVENTS

    declare __brand: 'Map'

    event = new Emitter<{ delete: [K]; set: [K, V]; clear: []; [ALL_EVENTS]: [] }>()
    private _asValues: V[] | undefined
    get asValues() {
        return (this._asValues ??= this.size ? [...this.values()] : EMPTY_LIST)
    }
    override clear() {
        super.clear()
        this._asValues = undefined
        tick(() => this.event.emit('clear'))
    }
    override delete(key: K) {
        const _ = super.delete(key)
        this._asValues = undefined
        tick(() => this.event.emit('delete', key))
        return _
    }
    override set(key: K, value: V) {
        const _ = super.set(key, value)
        this._asValues = undefined
        tick(() => this.event.emit('set', key, value))
        this.event.emit('set', key, value)
        return _
    }
}
export class ObservableSet<T> extends Set<T> {
    readonly ALL_EVENTS: typeof ALL_EVENTS = ALL_EVENTS
    declare __brand: 'ObservableSet'

    event = new Emitter<{ delete: [T]; add: [T[]]; clear: []; [ALL_EVENTS]: [] }>()
    private _asValues: T[] | undefined
    get asValues() {
        return (this._asValues ??= this.size ? [...this.values()] : EMPTY_LIST)
    }
    override clear() {
        super.clear()
        this._asValues = undefined
        tick(() => this.event.emit('clear'))
    }
    override delete(key: T) {
        const _ = super.delete(key)
        this._asValues = undefined
        tick(() => this.event.emit('delete', key))
        return _
    }
    override add(...value: T[]) {
        value.forEach((x) => super.add(x))
        this._asValues = undefined
        this.event.emit('add', value)
        tick(() => this.event.emit('add', value))
        return this
    }
}
