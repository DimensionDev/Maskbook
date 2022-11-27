import type { NetworkPluginID } from '@masknet/shared-base'
import type { AbstractAccountAPI } from './AbstractAccount.js'

export namespace ContractAccountAPI {
    export interface ContractAccount<T extends NetworkPluginID> extends AbstractAccountAPI.AbstractAccount<T> {
        /** Has deployed as a smart contract */
        deployed: boolean
        /** Has funded by sponsor */
        funded: boolean
    }

    export interface Provider<T extends NetworkPluginID> {
        getAccounts(owner: string[]): Promise<ContractAccount<T>>
    }
}
