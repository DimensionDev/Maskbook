import type { Subscription } from 'use-subscription'
import { type StorageItem } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { RiskWarningState } from '../../Base/state/RiskWarning.js'
import defer * as Warning from '../../../RiskWarning/index.js'

export class EVMRiskWarning extends RiskWarningState {
    constructor(account: Subscription<string> | undefined, storage: StorageItem<Record<string, boolean>>) {
        super(account, formatEthereumAddress, storage)
    }

    override async approve(address: string, pluginID?: string | undefined) {
        await Warning.RiskWarning.approve(address, pluginID)
        await super.approve(address)
    }
}
