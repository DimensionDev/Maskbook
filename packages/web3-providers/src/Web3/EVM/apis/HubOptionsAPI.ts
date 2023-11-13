import { getDefaultChainId, type ChainId, getNetworkPluginID } from '@masknet/web3-shared-evm'
import { HubOptionsProvider } from '../../Base/apis/HubOptions.js'
import { evm } from '../../../Manager/registry.js'
import type { CurrencyType } from '@masknet/web3-shared-base'

export class EVMHubOptionsProvider extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID

    protected override getAccount(): string | undefined {
        return evm.state?.Provider?.account?.getCurrentValue()
    }

    protected override getChainId(): ChainId | undefined {
        return evm.state?.Provider?.chainId?.getCurrentValue()
    }

    protected override getCurrencyType(): CurrencyType | undefined {
        return evm.state?.Settings?.currencyType?.getCurrentValue()
    }
}
