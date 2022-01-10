import { isNull } from 'lodash-unified'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../../EVM/messages'
import { getOrderUnitPrice } from '@masknet/web3-providers'
import { ZERO } from '@masknet/web3-shared-base'

export async function getNFT(address: string, tokenId: string) {
    const asset = await EVM_RPC.getAsset({
        address,
        tokenId,
        chainId: ChainId.Mainnet,
        provider: NonFungibleAssetProvider.OPENSEA,
    })
    const amount =
        getOrderUnitPrice(
            asset?.desktopOrder?.current_price,
            asset?.desktopOrder?.payment_token_contract?.decimals ?? 0,
            asset?.desktopOrder?.quantity ?? '1',
        ) ?? ZERO
    return {
        amount: amount.toFixed(),
        name: asset?.name ?? '',
        symbol: asset?.desktopOrder?.payment_token_contract?.symbol ?? 'ETH',
        image: asset?.image_url ?? '',
        owner: asset?.top_ownerships[0].owner.address ?? '',
    }
}

export async function createNFT(address: string, tokenId: string) {
    return EVM_RPC.getNFT({ address, tokenId, chainId: ChainId.Mainnet, provider: NonFungibleAssetProvider.OPENSEA })
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
