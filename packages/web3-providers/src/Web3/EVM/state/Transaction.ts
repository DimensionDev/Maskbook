import type { Subscription } from 'use-subscription'
import { type StorageItem } from '@masknet/shared-base'
import {
    type ChainId,
    type Transaction as EVM_Transaction,
    formatEthereumAddress,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { TransactionState, type TransactionStorage } from '../../Base/state/Transaction.js'

export class EVMTransaction extends TransactionState<ChainId, EVM_Transaction> {
    constructor(
        subscriptions: { account?: Subscription<string>; chainId?: Subscription<ChainId> },
        storage: StorageItem<TransactionStorage<ChainId, EVM_Transaction>>,
    ) {
        super(subscriptions, { formatAddress: formatEthereumAddress, isValidChainId }, storage)
    }
}
