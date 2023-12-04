import { ChainIdList, formatAddress, isValidChainId, type ChainId, type Transaction } from '@masknet/web3-shared-flow'
import type { Subscription } from 'use-subscription'
import { TransactionState } from '../../Base/state/Transaction.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class FlowTransaction extends TransactionState<ChainId, Transaction> {
    constructor(
        protected override subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(ChainIdList, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_FLOW,
            formatAddress,
            isValidChainId,
        })
    }
}
