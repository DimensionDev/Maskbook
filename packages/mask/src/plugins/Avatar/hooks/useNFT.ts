import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
import { getNFT, getNFTByChain } from '../utils'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(address: string, tokenId: string, chainId?: ChainId) {
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        let f = NFTCache.get(`${address}-${tokenId}-${chainId ?? ChainId.Mainnet}`)
        if (!f) {
            f = _getNFT(address, tokenId, chainId ?? ChainId.Mainnet)
            NFTCache.set(`${address}-${tokenId}-${chainId ?? ChainId.Mainnet}`, f)
        }
        return f
    }, [address, tokenId, NFTCache, getNFT, chainId])
}

async function _getNFT(address: string, tokenId: string, chainId: ChainId) {
    if (chainId === ChainId.Mainnet) {
        return getNFT(address, tokenId)
    }
    const nft = await getNFTByChain(address, tokenId, chainId)
    return {
        amount: '0',
        name: nft?.contractDetailed.name ?? '',
        symbol: nft?.contractDetailed.symbol ?? 'ETH',
        image: nft?.info.imageURL ?? '',
        owner: nft?.info.owner ?? '',
        slug: '',
    }
}
