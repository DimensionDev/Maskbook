import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
<<<<<<< HEAD
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(address: string, tokenId: string, chainId?: ChainId) {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
=======
import { getNFT, getNFTByChain } from '../utils'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(address: string, tokenId: string, chainId?: ChainId) {
>>>>>>> develop
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        let f = NFTCache.get(`${address}-${tokenId}-${chainId ?? ChainId.Mainnet}`)
        if (!f) {
<<<<<<< HEAD
            f = _getNFT(connection, address, tokenId, chainId)
            NFTCache.set(`${address}-${tokenId}-${chainId ?? ChainId.Mainnet}`, f)
        }
        return f
    }, [address, tokenId, NFTCache, connection, chainId])
}

async function _getNFT(connection: any, address: string, tokenId: string, chainId?: ChainId) {
    const nft = await connection.getNonFungibleToken(address, tokenId, { chainId })
    return {
        amount: '0',
        name: nft?.contract?.name ?? '',
        symbol: nft?.contract?.symbol ?? 'ETH',
        image: nft?.metadata?.imageURL ?? '',
        owner: nft?.contract?.owner ?? '',
=======
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
>>>>>>> develop
        slug: '',
    }
}
