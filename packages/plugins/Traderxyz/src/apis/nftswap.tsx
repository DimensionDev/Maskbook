import { NftSwap } from '@traderxyz/nft-swap-sdk'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { useWeb3Provider, ChainId } from '@masknet/web3-shared-evm'
import { memoize } from 'lodash-unified'

const useTraderApi_ = memoize(
    (chainId: ChainId) => {
        const p = useWeb3Provider()
        const provider = new Web3Provider(p as unknown as ExternalProvider, chainId)
        const signer = provider.getSigner(0)
        return new NftSwap(provider, signer, chainId)
    },
    (chainId: ChainId) => String(chainId),
)

export function useTraderApi(chainId: number) {
    return useTraderApi_(chainId)
}
