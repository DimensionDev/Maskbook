import type { Subscription } from 'use-subscription'
import { type ChainId, type Transaction, formatAddress, isValidChainId, ChainIdList } from '@masknet/web3-shared-solana'
import { TransactionState } from '../../Base/state/Transaction.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class SolanaTransaction extends TransactionState<ChainId, Transaction> {
    constructor(subscriptions: { account?: Subscription<string>; chainId?: Subscription<ChainId> }) {
        super(ChainIdList, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            formatAddress,
            isValidChainId,
        })
    }
}
