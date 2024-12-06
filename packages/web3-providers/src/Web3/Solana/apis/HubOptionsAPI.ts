import { CurrencyType } from '@masknet/web3-shared-base'
import { getDefaultChainId, getNetworkPluginID } from '@masknet/web3-shared-solana'
import type { ChainId } from '@masknet/web3-shared-solana'
import { HubOptionsProvider } from '../../Base/apis/HubOptions.js'
import { solana } from '../../../Manager/registry.js'

export class SolanaHubOptionsAPI extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID

    protected override getAccount() {
        return solana.state?.Wallet?.account?.getCurrentValue()
    }

    protected override getChainId() {
        return solana.state?.Wallet?.chainId?.getCurrentValue()
    }

    protected override getCurrencyType() {
        return CurrencyType.USD
    }
}
