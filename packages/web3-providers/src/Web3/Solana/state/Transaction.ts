import type { Subscription } from 'use-subscription'
import { type ChainId, type Transaction, formatAddress, isValidChainId } from '@masknet/web3-shared-solana'
import { TransactionState, type TransactionStorage } from '../../Base/state/Transaction.js'
import { type StorageItem } from '@masknet/shared-base'

export class SolanaTransaction extends TransactionState<ChainId, Transaction> {
    constructor(
        subscriptions: { account?: Subscription<string>; chainId?: Subscription<ChainId> },
        storage: StorageItem<TransactionStorage<ChainId, Transaction>>,
    ) {
        super(subscriptions, { formatAddress, isValidChainId }, storage)
    }
}
