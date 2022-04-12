import { NftSwap } from '@traderxyz/nft-swap-sdk'
import { createExternalProvider } from '../../../web3/helpers'
import { ExternalProvider, Network, Web3Provider } from '@ethersproject/providers'
import { useChainId, getNetworkName } from '@masknet/web3-shared-evm'

export function getTraderApi() {
    const chainId = useChainId()
    const network_name = getNetworkName(chainId)
    const network = {
        name: network_name,
        chainId: chainId,
    }
    const provider = new Web3Provider(createExternalProvider() as unknown as ExternalProvider, chainId)
    const signer = provider.getSigner()
    return new NftSwap(provider, signer, chainId)
}
