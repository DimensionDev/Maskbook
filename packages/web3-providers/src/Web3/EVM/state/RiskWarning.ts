import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { RiskWarning as RiskWarningAPI } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { RiskWarningState } from '../../Base/state/RiskWarning.js'

export class RiskWarning extends RiskWarningState {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscription: {
            account?: Subscription<string>
        },
    ) {
        super(context, subscription, {
            formatAddress: formatEthereumAddress,
        })
    }

    override async approve(address: string, pluginID?: string | undefined) {
        await RiskWarningAPI.approve(address, pluginID)
        await super.approve(address)
    }
}
