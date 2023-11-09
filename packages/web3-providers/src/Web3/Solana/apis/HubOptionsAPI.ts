import { getDefaultChainId, getNetworkPluginID } from '@masknet/web3-shared-solana'
import type { ChainId } from '@masknet/web3-shared-solana'
import { HubOptionsProvider } from '../../Base/apis/HubOptionsAPI.js'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'

export class SolanaHubOptionsAPI extends HubOptionsProvider<ChainId> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getNetworkPluginID = getNetworkPluginID
    protected override getAccount() {
        return SolanaWeb3StateRef.value?.Provider?.account?.getCurrentValue()
    }
    protected override getChainId() {
        return SolanaWeb3StateRef.value?.Provider?.chainId?.getCurrentValue()
    }
    protected override getCurrencyType() {
        return SolanaWeb3StateRef.value?.Settings?.currencyType?.getCurrentValue()
    }
}
