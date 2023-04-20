import type { Plugin } from '@masknet/plugin-infra'
import type { NetworkPluginID, ValueRefWithReady } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace Web3StateAPI {
    export interface Provider<T extends NetworkPluginID> {
        /**
         * A singleton method to set plugin shared context into this web3 state.
         * @param context
         */
        setup(state: Web3Helper.Definition[T]['Web3State']): void

        /**
         * Create web3 state if a context was set.
         */
        create(context: Plugin.Shared.SharedUIContext): Promise<Web3Helper.Definition[T]['Web3State']>

        readonly ref: ValueRefWithReady<Web3Helper.Definition[T]['Web3State']>

        /**
         * Access state fearlessly.
         * Please make sure you have set a context before access it.
         * Otherwise, you will get a runtime error.
         */
        readonly state: Web3Helper.Definition[T]['Web3State']
    }
}
