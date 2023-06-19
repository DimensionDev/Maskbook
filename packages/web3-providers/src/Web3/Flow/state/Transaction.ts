import type { Plugin } from '@masknet/plugin-infra'
import {
    ChainIdList,
    formatAddress,
    isValidChainId,
    type ChainId,
    type Transaction as FlowTransaction,
} from '@masknet/web3-shared-flow'
import type { Subscription } from 'use-subscription'
import { TransactionState } from '../../Base/state/Transaction.js'

export class Transaction extends TransactionState<ChainId, FlowTransaction> {
    constructor(
        protected override context: Plugin.Shared.SharedUIContext,
        protected override subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            formatAddress,
            isValidChainId,
        })
    }
}
