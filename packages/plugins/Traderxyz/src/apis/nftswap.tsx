import { NftSwap } from '@traderxyz/nft-swap-sdk'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { getNetworkName, useWeb3Provider } from '@masknet/web3-shared-evm'

export function useTraderApi(chainId: number) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const p = useWeb3Provider()
    const network_name = getNetworkName(chainId)
    const provider = new Web3Provider(p as unknown as ExternalProvider, chainId)
    const signer = provider.getSigner(0)
    return new NftSwap(provider, signer, chainId)
}

// export function useTraderApi1(chainId: number,provider:ExternalProvider) {
//     const p = getDefaultProvider()
//     const { RPC } = getRPCConstants(chainId)
//     const providerURL = first(RPC)
//     const provider = new JsonRpcProvider(providerURL)
//     const signer = provider.getSigner()
//     return new NftSwap(p, signer, chainId)
