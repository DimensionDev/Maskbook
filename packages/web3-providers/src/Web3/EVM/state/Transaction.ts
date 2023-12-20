import type { Subscription } from 'use-subscription'
import { NetworkPluginID, type StorageItem } from '@masknet/shared-base'
import {
    type ChainId,
    type Transaction as EVM_Transaction,
    formatEthereumAddress,
    isValidChainId,
    ChainIdList,
} from '@masknet/web3-shared-evm'
import { TransactionState, type TransactionStorage } from '../../Base/state/Transaction.js'

export class EVMTransaction extends TransactionState<ChainId, EVM_Transaction> {
    constructor(
        subscriptions: { account?: Subscription<string>; chainId?: Subscription<ChainId> },
        storage: StorageItem<TransactionStorage<ChainId, EVM_Transaction>>,
    ) {
        super(
            ChainIdList,
            subscriptions,
            {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                formatAddress: formatEthereumAddress,
                isValidChainId,
            },
            storage,
        )
    }
}
