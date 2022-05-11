import { first, isNull } from 'lodash-unified'
import {
    ChainId,
    NonFungibleAssetProvider,
    formatBalance,
    createContract,
    createWeb3,
    getERC721ContractDetailed,
    getERC721TokenDetailedFromChain,
    ERC721TokenDetailed,
    getERC721TokenAssetFromChain,
} from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../../EVM/messages'
import Services from '../../../extension/service'
import { getOrderUnitPrice, NextIDProof, NextIDStorage, NonFungibleTokenAPI } from '@masknet/web3-providers'
import { ZERO } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { NextIDPersonaBindings, NextIDPlatform } from '@masknet/shared-base'
import type { NextIDAvatarMeta } from '../types'
import { PLUGIN_ID } from '../constants'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'

function getLastSalePrice(lastSale?: NonFungibleTokenAPI.AssetEvent | null) {
    if (!lastSale?.total_price || !lastSale?.payment_token?.decimals) return
    return formatBalance(lastSale.total_price, lastSale.payment_token.decimals)
}

export async function getNFTByOpensea(address: string, tokenId: string) {
    const asset = await EVM_RPC.getAsset({
        address,
        tokenId,
        chainId: ChainId.Mainnet,
        provider: NonFungibleAssetProvider.OPENSEA,
    })

    if (!asset) return
    return {
        name: asset?.name ?? '',
        symbol: asset?.desktopOrder?.payment_token_contract?.symbol ?? 'ETH',
        owner: asset?.top_ownerships[0].owner.address ?? '',
    }
}

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
        ) ??
        getLastSalePrice(asset?.last_sale) ??
        ZERO
    return {
        amount: new BigNumber(amount).toFixed(),
        name: asset?.name ?? '',
        symbol: asset?.desktopOrder?.payment_token_contract?.symbol ?? 'ETH',
        image: asset?.image_url ?? '',
        owner: asset?.top_ownerships[0].owner.address ?? '',
        slug: asset?.slug ?? '',
    }
}

export async function getNFTByChain(
    address: string,
    tokenId: string,
    chainId: ChainId,
): Promise<ERC721TokenDetailed | undefined> {
    const web3 = createWeb3(Services.Ethereum.request, () => ({
        chainId,
    }))
    const contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
    if (!contract) return

    const contractDetailed = await getERC721ContractDetailed(contract, address, chainId)
    const tokenDetailedFromChain = await getERC721TokenDetailedFromChain(contractDetailed, contract, tokenId)
    if (!tokenDetailedFromChain) return
    const info = await getERC721TokenAssetFromChain(tokenDetailedFromChain?.info.tokenURI)
    const owner = await contract.methods.ownerOf(tokenId).call()
    if (info && tokenDetailedFromChain) {
        tokenDetailedFromChain.info = {
            ...info,
            owner,
            ...tokenDetailedFromChain.info,
            hasTokenDetailed: true,
            name: info?.name ?? tokenDetailedFromChain?.info.name ?? '',
        }
    }
    return tokenDetailedFromChain
}

export async function createNFT(address: string, tokenId: string, chainId?: ChainId) {
    const token = await getNFTByChain(address, tokenId, chainId ?? ChainId.Mainnet)
    if (token) return token
    return EVM_RPC.getNFT({
        address,
        tokenId,
        chainId: chainId ?? ChainId.Mainnet,
        provider: chainId === ChainId.Matic ? NonFungibleAssetProvider.NFTSCAN : NonFungibleAssetProvider.OPENSEA,
    })
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

export function formatPrice(amount: string, symbol: string) {
    const _amount = new BigNumber(amount ?? '0')
    if (_amount.isZero()) return ''
    if (_amount.isLessThan(1)) return `${_amount.toFixed(2)} ${symbol}`
    if (_amount.isLessThan(1e3)) return `${_amount.toFixed(1)} ${symbol}`
    if (_amount.isLessThan(1e6)) return `${_amount.div(1e6).toFixed(1)}K ${symbol}`
    return `${_amount.div(1e6).toFixed(1)}M ${symbol}`
}

export function formatText(name: string, tokenId: string) {
    const _name = name.replace(/#\d*/, '').trim()
    let token = tokenId
    if (tokenId.length > 10) {
        token = tokenId.slice(0, 6) + '...' + tokenId.slice(-4)
    }
    return `${_name} #${token}`
}

export function formatTokenId(symbol: string, tokenId: string) {
    const name = `${symbol} #${tokenId}`
    return name.length > 18 ? name.slice(0, 18) + '...' : name
}

export const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId: string): number => {
    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.created_at > p_b.created_at) return -1
    return 1
}

export async function getNFTAvatarByUserId(userId: string): Promise<NextIDAvatarMeta | undefined> {
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const bindings = await NextIDProof.queryExistedBindingByPlatform(platform, userId.toLowerCase())

    for (const binding of bindings.sort((a, b) => sortPersonaBindings(a, b, userId))) {
        const response = await NextIDStorage.getByIdentity<NextIDAvatarMeta>(
            binding.persona,
            platform,
            userId.toLowerCase(),
            PLUGIN_ID,
        )
        if (response.ok) return response.val
    }
    return
}
