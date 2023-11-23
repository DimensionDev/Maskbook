import type { Subscription } from 'use-subscription'
import type { WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { RiskWarningState } from '../../Base/state/RiskWarning.js'
import * as Warning from /* webpackDefer: true */ '../../../RiskWarning/index.js'

export class EVMRiskWarning extends RiskWarningState {
    constructor(
        context: WalletAPI.IOContext,
        subscription: {
            account?: Subscription<string>
        },
    ) {
        super(context, subscription, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            formatAddress: formatEthereumAddress,
        })
    }

    override async approve(address: string, pluginID?: string | undefined) {
        await Warning.RiskWarning.approve(address, pluginID)
        await super.approve(address)
    }
}
