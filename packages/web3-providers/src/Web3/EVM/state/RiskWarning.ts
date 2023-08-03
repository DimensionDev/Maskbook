import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { RiskWarningState } from '../../Base/state/RiskWarning.js'
import { RiskWarningAPI } from '../../../RiskWarning/index.js'

export class RiskWarning extends RiskWarningState {
    private Warning = new RiskWarningAPI()

    constructor(
        context: Plugin.Shared.SharedUIContext,
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
        await this.Warning.approve(address, pluginID)
        await super.approve(address)
    }
}
