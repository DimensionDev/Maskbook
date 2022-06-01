import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
import { useWeb3Connection, useWeb3Hub } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(address: string, tokenId: string, chainId?: ChainId) {
    const [, getNFT] = useGetNFT(NetworkPluginID.PLUGIN_EVM, chainId)

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        let f = NFTCache.get(`${address}-${tokenId}-${chainId ?? ChainId.Mainnet}`)
        if (!f) {
            f = getNFT(address, tokenId)
            NFTCache.set(`${address}-${tokenId}-${chainId ?? ChainId.Mainnet}`, f)
        }
        return f
    }, [address, tokenId, NFTCache, connection, chainId])
}

function useGetNFT(currentPluginId: NetworkPluginID, chainId?: ChainId) {
    const connection = useWeb3Connection(currentPluginId, { chainId })
    const hub = useWeb3Hub(currentPluginId, { chainId })

    return useAsyncFn(
        async (address: string, tokenId: string) => {
            if (hub?.getNonFungibleAsset) {
                const asset = await hub.getNonFungibleAsset(address, tokenId)
                if (asset) {
                    return {
                        amount: asset.price?.[CurrencyType.NATIVE] ?? '0',
                        name: asset.contract?.name ?? '',
                        symbol: asset.contract?.symbol ?? 'ETH',
                        image: asset.metadata?.imageURL ?? '',
                        owner: asset.contract?.owner ?? '',
                        slug: asset.collection?.slug ?? '',
                    }
                }
            }
            const nft = await connection?.getNonFungibleToken(address, tokenId)
            return {
                amount: '0',
                name: nft?.contract?.name ?? '',
                symbol: nft?.contract?.symbol ?? 'ETH',
                image: nft?.metadata?.imageURL ?? '',
                owner: nft?.contract?.owner ?? '',
                slug: '',
            }
        },
        [connection, hub],
    )
}
