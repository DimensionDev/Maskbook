import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import {
    type ChainId,
    type Transaction as EVM_Transaction,
    formatEthereumAddress,
    isValidChainId,
    ChainIdList,
} from '@masknet/web3-shared-evm'
import { TransactionState } from '../../Base/state/Transaction.js'

export class Transaction extends TransactionState<ChainId, EVM_Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            formatAddress: formatEthereumAddress,
            isValidChainId,
        })
    }
}
