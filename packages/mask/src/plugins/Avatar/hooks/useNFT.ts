import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useWeb3Hub, useWeb3State } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { NFTInfo } from '../types'

export function useNFT(
    account: string,
    address: string | undefined,
    tokenId: string | undefined,
    pluginId: NetworkPluginID = NetworkPluginID.PLUGIN_EVM,
    chainId: ChainId = ChainId.Mainnet,
) {
    const { Others, Connection } = useWeb3State<'all'>(pluginId ?? NetworkPluginID.PLUGIN_EVM)
    const hub = useWeb3Hub<'all'>(pluginId, {
        chainId,
        account,
    })
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        const connection = await Connection?.getConnection?.({
            chainId,
            account,
        })
        const [token, asset] = await Promise.all([
            connection?.getNonFungibleToken(address, tokenId),
            hub?.getNonFungibleAsset?.(address, tokenId, {
                chainId,
            }),
        ])

        const contract = token?.contract || asset?.contract
        const metadata = token?.metadata || asset?.metadata

        const amount = asset?.priceInToken?.amount ?? asset?.price?.[CurrencyType.USD] ?? '0'
        const name = contract?.name || metadata?.name || ''
        const imageURL = metadata?.imageURL
        const permalink = token ? Others?.explorerResolver.nonFungibleTokenLink(chainId, address, tokenId) : asset?.link

        return {
            amount,
            name,
            symbol: asset?.priceInToken?.token.symbol ?? asset?.paymentTokens?.[0].symbol ?? '<Symbol Unknown>',
            image: imageURL,
            owner: token?.ownerId ?? asset?.owner?.address ?? asset?.ownerId,
            // Not all NFT markets have slug in the URL
            slug: token ? undefined : asset?.collection?.slug,
            permalink,
        } as NFTInfo
    }, [hub?.getNonFungibleAsset, Connection?.getConnection, address, tokenId, Others, chainId])
}
