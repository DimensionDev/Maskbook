import BigNumber from 'bignumber.js'
import { head, isNull } from 'lodash-unified'
import { PluginCollectibleRPC } from '../../Collectible/messages'
import { getLastSalePrice, getOrderUnitPrice, getOrderUSDPrice } from '../../Collectible/utils'
import { ChainId, createERC721Token, EthereumTokenType } from '@masknet/web3-shared-evm'
import type { AssetOrder } from '../../Collectible/types'
import Services from '../../../extension/service'

export async function getNFT(address: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(address, tokenId, ChainId.Mainnet)

    let orders: AssetOrder[] = []
    if (asset.sell_orders?.length) {
        orders = asset.sell_orders
    } else if (asset.orders?.length) {
        orders = asset.orders
    } else if (asset.buy_orders?.length) {
        orders = asset.buy_orders
    }

    const order = head(
        orders.sort((a, b) =>
            new BigNumber(
                getOrderUSDPrice(
                    b.current_price,
                    b.payment_token_contract?.usd_price,
                    b.payment_token_contract?.decimals,
                ) ?? 0,
            )
                .minus(
                    getOrderUSDPrice(
                        a.current_price,
                        a.payment_token_contract?.usd_price,
                        a.payment_token_contract?.decimals,
                    ) ?? 0,
                )
                .toNumber(),
        ),
    )

    return {
        amount: order
            ? new BigNumber(
                  getOrderUnitPrice(order.current_price, order.payment_token_contract?.decimals, order.quantity) ?? 0,
              ).toFixed()
            : getLastSalePrice(asset.last_sale) ?? '0',
        name: asset.name,
        symbol: order?.payment_token_contract?.symbol ?? asset.last_sale?.payment_token?.symbol ?? 'ETH',
        image: asset.animation_url ?? asset.image_url_original ?? asset.image_url ?? asset.image_preview_url ?? '',
        owner: asset.owner.address,
    }
}

export async function createNFT(address: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(address, tokenId, ChainId.Mainnet)
    const token = createERC721Token(
        {
            chainId: ChainId.Mainnet,
            type: EthereumTokenType.ERC721,
            name: asset.asset_contract.name,
            symbol: asset.asset_contract.token_symbol,
            address: asset.asset_contract.address,
        },
        {
            name: asset.name,
            description: asset.description,
            image: asset.animation_url ?? asset.image_url_original ?? asset.image_url ?? asset.image_preview_url ?? '',
            owner: asset.top_ownerships[0].owner.address,
        },
        tokenId,
    )
    return token
}

export async function getImage(image: string): Promise<string> {
    const blob = await Services.Helper.fetch(image)
    return (await blobToBase64(blob)) as string
}

function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

export function toPNG(image: string) {
    return new Promise<Blob | null>((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) throw new Error('Canvas was not supported')
        img.addEventListener('load', () => {
            ;[canvas.width, canvas.height] = [img.width, img.height]
            ctx.drawImage(img, 0, 0, img.width, img.height)
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })
        img.addEventListener('error', () => {
            reject(new Error('Could not load image'))
        })
        img.setAttribute('CrossOrigin', 'Anonymous')
        img.src = image
    })
}
