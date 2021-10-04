import { ChainId, createERC721Token, EthereumTokenType } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { head, isNull } from 'lodash-es'
import type { Order } from 'opensea-js/lib/types'
import { PluginCollectibleRPC } from '../../Collectible/messages'
import { getLastSalePrice, getOrderUnitPrice, getOrderUSDPrice } from '../../Collectible/utils'

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
        name: asset.name,
        symbol: order?.paymentTokenContract?.symbol ?? asset.lastSale?.paymentToken?.symbol ?? 'ETH',
        image: asset.imageUrl ?? asset.imagePreviewUrl ?? '',
    }
}

export async function createNFT(address: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(address, tokenId, ChainId.Mainnet)
    const token = createERC721Token(
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
    return { account: asset.owner.address, token }
}

export function toPng(image: string) {
    return new Promise<Blob | null>((resolve, reject) => {
        const img = new Image()
        img.src = image
        img.setAttribute('CrossOrigin', 'Anonymous')
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) throw new Error('Canvas was not supported')

        img.addEventListener('load', () => {
            ;[canvas.width, canvas.height] = [img.width, img.height]
            ctx.drawImage(img, 0, 0, img.width, img.height)
            canvas.toBlob((blob) => {
                resolve(blob)
            })
        })
        img.addEventListener('error', () => {
            reject(new Error('Could not load image'))
        })
    })
}
