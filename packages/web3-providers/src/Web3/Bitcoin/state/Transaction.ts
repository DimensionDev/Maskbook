import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    ChainIdList,
    formatBitcoinAddress,
    isValidChainId,
    type ChainId,
    type Transaction as BitcoinTransaction,
} from '@masknet/web3-shared-bitcoin'
import { TransactionState } from '../../Base/state/Transaction.js'

export class Transaction extends TransactionState<ChainId, BitcoinTransaction> {
    constructor(
        protected override context: Plugin.Shared.SharedUIContext,
        protected override subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_BITCOIN,
            formatAddress: formatBitcoinAddress,
            isValidChainId,
        })
    }
}
