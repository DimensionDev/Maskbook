import { ChainId, createERC721Token, EthereumTokenType, isSameAddress } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { head } from 'lodash-es'
import type { Order } from 'opensea-js/lib/types'
import { PluginCollectibleRPC } from '../../../../plugins/Collectible/messages'
import { getLastSalePrice, getOrderUnitPrice, getOrderUSDPrice } from '../../../../plugins/Collectible/utils'

export async function getNFT(address: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(address, tokenId, ChainId.Mainnet)

    let orders: Order[] = []
    if (asset.sellOrders?.length) {
        orders = asset.sellOrders
    } else if (asset.orders?.length) {
        orders = asset.orders
    } else if (asset.buyOrders?.length) {
        orders = asset.buyOrders
    }

    const order = head(
        orders.sort((a, b) => new BigNumber(getOrderUSDPrice(b) ?? 0).minus(getOrderUSDPrice(a) ?? 0).toNumber()),
    )

    return {
        amount: order
            ? new BigNumber(getOrderUnitPrice(order) ?? 0).toFixed()
            : getLastSalePrice(asset.lastSale) ?? '0',
        name: asset.assetContract.name,
        symbol: order?.paymentTokenContract?.symbol ?? asset.lastSale?.paymentToken?.symbol ?? 'ETH',
        image: asset.imageUrl ?? asset.imagePreviewUrl ?? '',
    }
}

export async function createNFT(account: string, address: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(address, tokenId, ChainId.Mainnet)
    if (!isSameAddress(asset.owner.address, account)) throw new Error('TokenId does not belong to account')
    return createERC721Token(
        {
            chainId: ChainId.Mainnet,
            type: EthereumTokenType.ERC721,
            name: asset.assetContract.name,
            symbol: asset.assetContract.tokenSymbol,
            address: asset.assetContract.address,
        },
        { name: asset.name, description: asset.description, image: asset.imageUrl ?? asset.imagePreviewUrl ?? '' },
        tokenId,
    )
}
