import { type ValueRefWithReady } from '@masknet/shared-base'
import { type PluginContextAPI } from '../../entry-types.js'

export class BaseContextAPI<T> implements PluginContextAPI.Provider<T> {
    constructor(private _ref: ValueRefWithReady<T>) {}

    get ref(): ValueRefWithReady<T> {
        return this._ref
    }

    setup(context: T) {
        this._ref.value = context
    }

    get context() {
        return this._ref.value
    }
}
