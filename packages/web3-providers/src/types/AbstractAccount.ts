import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace AbstractAccountAPI {
    export interface AbstractAccount<T extends NetworkPluginID> {
        pluginID: T
        chainId: Web3Helper.Definition[T]['ChainId']
        id: string
        address: string
        owner: string
        index: string
    }

    export interface Provider<T extends NetworkPluginID> {
        getAccounts(owner: string[]): Promise<AbstractAccount<T>>
    }
}
