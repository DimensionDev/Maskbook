import { type ValueRefWithReady } from '@masknet/shared-base'

export namespace PluginContextAPI {
    export interface Provider<T> {
        setup(context: T): void

        get ref(): ValueRefWithReady<T>

        get context(): T
    }
}
