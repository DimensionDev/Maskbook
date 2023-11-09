import type { WalletAPI } from '../../../entry-types.js'
import { ChainIdList, formatAddress, isValidChainId, type ChainId, type Transaction } from '@masknet/web3-shared-flow'
import type { Subscription } from 'use-subscription'
import { TransactionState } from '../../Base/state/Transaction.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class FlowTransaction extends TransactionState<ChainId, Transaction> {
    constructor(
        protected override context: WalletAPI.IOContext,
        protected override subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_FLOW,
            formatAddress,
            isValidChainId,
        })
    }
}
