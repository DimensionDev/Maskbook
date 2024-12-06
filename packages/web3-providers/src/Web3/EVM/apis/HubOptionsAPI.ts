import { CurrencyType } from '@masknet/web3-shared-base'
import { type ChainId, getDefaultChainId, getNetworkPluginID } from '@masknet/web3-shared-evm'
import { HubOptionsProvider } from '../../Base/apis/HubOptions.js'
import { evm } from '../../../Manager/registry.js'

export class EVMHubOptionsProvider extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID

    protected override getAccount(): string | undefined {
        return evm.state?.Wallet?.account?.getCurrentValue()
    }

    protected override getChainId(): ChainId | undefined {
        return evm.state?.Wallet?.chainId.getCurrentValue()
    }

    protected override getCurrencyType(): CurrencyType | undefined {
        return CurrencyType.USD
    }
}
