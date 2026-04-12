import type { Subscription } from 'use-subscription'
import type { StorageItem } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { RiskWarningState } from '../../Base/state/RiskWarning.js'

/**
 * @deprecated
 */
export class EVMRiskWarning extends RiskWarningState {
    constructor(account: Subscription<string> | undefined, storage: StorageItem<Record<string, boolean>>) {
        super(account, formatEthereumAddress, storage)
    }

    override async approve(address: string, _pluginID?: string | undefined) {
        await super.approve(address)
    }
}
