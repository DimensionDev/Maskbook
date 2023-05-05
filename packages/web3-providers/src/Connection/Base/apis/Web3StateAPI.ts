import type { Plugin } from '@masknet/plugin-infra'
import type { NetworkPluginID, ValueRefWithReady } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Web3StateAPI } from '../../../entry-types.js'

export class Web3StateAPI_Base<T extends NetworkPluginID> implements Web3StateAPI.Provider<T> {
    constructor(private _ref: ValueRefWithReady<Web3Helper.Definition[T]['Web3State']>) {}

    get ref(): ValueRefWithReady<Web3Helper.Definition[T]['Web3State']> {
        return this._ref
    }

    get state(): Web3Helper.Definition[T]['Web3State'] {
        return this.ref.value
    }

    setup(state: Web3Helper.Definition[T]['Web3State']): void {
        this._ref.value = state
    }

    create(context: Plugin.Shared.SharedUIContext): Promise<Web3Helper.Definition[T]['Web3State']> {
        throw new Error('Method not implemented.')
    }
}
