import { getDefaultChainId, type ChainId, getNetworkPluginID } from '@masknet/web3-shared-evm'
import { HubOptionsProvider } from '../../Base/apis/HubOptionsAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'
import type { CurrencyType } from '@masknet/web3-shared-base'

export class EVMHubOptionsProvider extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID
    protected override getAccount(): string | undefined {
        return Web3StateRef.value?.Provider?.account?.getCurrentValue()
    }
    protected override getChainId(): ChainId | undefined {
        return Web3StateRef.value?.Provider?.chainId?.getCurrentValue()
    }
    protected override getCurrencyType(): CurrencyType | undefined {
        return Web3StateRef.value?.Settings?.currencyType?.getCurrentValue()
    }
}
