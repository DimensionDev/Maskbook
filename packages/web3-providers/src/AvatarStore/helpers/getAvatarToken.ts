import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CurrencyType, formatBalance } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { getUtils } from '../../Web3/Router/apis/getUtils.js'
import { getHub } from '../../Web3/Router/apis/getHub.js'
import { getConnection } from '../../Web3/Router/apis/getConnection.js'
import type { AvatarNextID, AvatarToken } from '../types.js'

export async function getAvatarToken<T extends NetworkPluginID>(
    pluginID: T,
    account: string,
    avatar: AvatarNextID<T>,
): Promise<AvatarToken> {
    const { chainId = ChainId.Mainnet, address, tokenId } = avatar

    const Utils = getUtils<T>(pluginID)
    const Connection = getConnection<T>(pluginID, {
        account,
        chainId,
    })
    const Hub = getHub<T>(pluginID, {
        account,
        chainId,
    })

    const allSettled = await Promise.allSettled([
        Connection?.getNonFungibleToken(address, tokenId),
        Hub.getNonFungibleAsset(address, tokenId, {
            account,
            chainId,
        }),
    ])

    const [token, asset] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)) as [
        Web3Helper.NonFungibleTokenAll | undefined,
        Web3Helper.NonFungibleAssetAll | undefined,
    ]

    const metadata = asset?.metadata || token?.metadata

    return {
        avatarId: avatar.avatarId,
        amount:
            asset?.priceInToken ?
                formatBalance(asset.priceInToken.amount, asset.priceInToken.token.decimals)
            :   (asset?.price?.[CurrencyType.USD] ?? '0'),
        name: metadata?.name ?? '',
        symbol: asset?.priceInToken ? asset.priceInToken.token.symbol : 'USD',
        image: metadata?.imageURL,
        owner: token?.ownerId ?? asset?.owner?.address ?? asset?.ownerId,
        // Not all NFT markets have slug in the URL
        slug: token ? undefined : asset?.collection?.slug,
        permalink: asset?.link ?? Utils.explorerResolver.nonFungibleTokenLink(chainId, address, tokenId),
        tokenId,
    }
}
