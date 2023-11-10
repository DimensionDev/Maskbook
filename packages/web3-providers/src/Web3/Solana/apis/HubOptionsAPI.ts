import { getDefaultChainId, getNetworkPluginID } from '@masknet/web3-shared-solana'
import type { ChainId } from '@masknet/web3-shared-solana'
import { HubOptionsProvider } from '../../Base/apis/HubOptions.js'
import { solana } from '../../../Manager/registry.js'

export class SolanaHubOptionsAPI extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID

    protected override getAccount() {
        return solana.state?.Provider?.account?.getCurrentValue()
    }

    protected override getChainId() {
        return solana.state?.Provider?.chainId?.getCurrentValue()
    }

    protected override getCurrencyType() {
        return solana.state?.Settings?.currencyType?.getCurrentValue()
    }
}
