import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
import { useCurrentWeb3NetworkPluginID, useWeb3Connection, useWeb3Hub } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(
    account: string,
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
) {
    const currentPluginId = useCurrentWeb3NetworkPluginID(pluginId)
    const [, getNFT] = useGetNFT(account, currentPluginId, chainId)
    return useAsyncRetry(async () => {
        if (!tokenId) return
        let f = NFTCache.get(`${address || tokenId}-${pluginId}-${tokenId}-${chainId ?? ChainId.Mainnet}`)
        if (!f) {
            f = getNFT(address, tokenId)
            NFTCache.set(`${address || tokenId}-${pluginId}-${tokenId}-${chainId ?? ChainId.Mainnet}`, f)
        }
        return f
    }, [address, tokenId, NFTCache, chainId, getNFT, pluginId])
}

function useGetNFT(account: string, currentPluginId: NetworkPluginID, chainId?: ChainId) {
    const connection = useWeb3Connection<'all'>(currentPluginId, { chainId, account })
    const hub = useWeb3Hub<'all'>(currentPluginId, { chainId, account })

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
                        owner: asset.metadata?.owner ?? '',
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
                owner: nft?.metadata?.owner ?? '',
                slug: '',
            }
        },
        [connection, hub],
    )
}
