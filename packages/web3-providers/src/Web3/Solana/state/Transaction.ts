import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import {
    type ChainId,
    type Transaction as SolanaTransaction,
    formatAddress,
    isValidChainId,
    ChainIdList,
} from '@masknet/web3-shared-solana'
import { TransactionState } from '../../Base/state/Transaction.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class Transaction extends TransactionState<ChainId, SolanaTransaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
            formatAddress,
            isValidChainId,
        })
    }
}
