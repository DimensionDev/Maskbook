import { NftSwap } from '@traderxyz/nft-swap-sdk'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { getNetworkName, useWeb3Provider } from '@masknet/web3-shared-evm'

export function getTraderApi(chainId: number) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const p = useWeb3Provider()
    const network_name = getNetworkName(chainId)
    const provider = new Web3Provider(p as unknown as ExternalProvider, chainId)
    const signer = provider.getSigner(0)
    return new NftSwap(provider, signer, chainId)
}
