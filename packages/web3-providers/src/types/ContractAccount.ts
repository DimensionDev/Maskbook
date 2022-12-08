import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { AbstractAccountAPI } from './AbstractAccount.js'

export namespace ContractAccountAPI {
    export interface ContractAccount<T extends NetworkPluginID> extends AbstractAccountAPI.AbstractAccount<T> {
        /** Has deployed as a smart contract */
        deployed: boolean
        /** Has funded by sponsor */
        funded: boolean
    }

    export interface Provider<T extends NetworkPluginID> {
        getAccountsByOwner(
            chainId: Web3Helper.Definition[T]['ChainId'],
            owner: string,
        ): Promise<Array<ContractAccount<T>>>
        getAccountsByOwners(
            chainId: Web3Helper.Definition[T]['ChainId'],
            owners: string[],
        ): Promise<Array<ContractAccount<T>>>
    }
}
