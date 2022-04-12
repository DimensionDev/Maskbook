import { NftSwap } from '@traderxyz/nft-swap-sdk'
// import { createExternalProvider } from '../../../../mask/src/web3/helpers'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { useChainId, getNetworkName, useWeb3Provider } from '@masknet/web3-shared-evm'

export function getTraderApi() {
    const chainId = useChainId()
    const network_name = getNetworkName(chainId)
    console.log('getTraderApi-chainId=', chainId)
    console.log('getTraderApi-network_name=', network_name)
    const network = {
        name: network_name,
        chainId: chainId,
    }
    const provider = new Web3Provider(useWeb3Provider() as unknown as ExternalProvider, chainId)
    const signer = provider.getSigner(0)
    return new NftSwap(provider, signer, chainId)
}
