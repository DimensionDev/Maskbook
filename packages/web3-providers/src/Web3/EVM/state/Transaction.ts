import type { Subscription } from 'use-subscription'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainId,
    type Transaction as EVM_Transaction,
    formatEthereumAddress,
    isValidChainId,
    ChainIdList,
} from '@masknet/web3-shared-evm'
import { TransactionState } from '../../Base/state/Transaction.js'

export class EVMTransaction extends TransactionState<ChainId, EVM_Transaction> {
    constructor(subscriptions: { account?: Subscription<string>; chainId?: Subscription<ChainId> }) {
        super(ChainIdList, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            formatAddress: formatEthereumAddress,
            isValidChainId,
        })
    }
}
