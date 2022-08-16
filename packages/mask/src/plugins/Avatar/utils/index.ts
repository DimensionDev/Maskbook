import { isNull } from 'lodash-unified'
import Services from '../../../extension/service'
import { NextIDProof, NextIDStorage } from '@masknet/web3-providers'
import BigNumber from 'bignumber.js'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { NextIDPlatform } from '@masknet/shared-base'
import type { NextIDAvatarMeta } from '../types'
import { PLUGIN_ID } from '../constants'
import { sortPersonaBindings } from '../../../utils'

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

async function fetchImage(url: string) {
    const fetch = globalThis.r2d2Fetch ?? globalThis.fetch
    const response = await fetch(url)
    return response.blob()
}

export async function toPNG(image: string) {
    const imageData = await fetchImage(image)
    return new Promise<Blob | null>((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) throw new Error('Canvas was not supported')
        img.addEventListener('load', () => {
            ;[canvas.width, canvas.height] = [img.width, img.height]
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })
        img.addEventListener('error', () => {
            reject(new Error('Could not load image'))
        })
        img.setAttribute('CrossOrigin', 'Anonymous')
        img.src = URL.createObjectURL(imageData)
    })
}

export function formatPrice(amount: string, symbol: string) {
    const _amount = new BigNumber(amount ?? '0')
    if (_amount.isZero() || _amount.isLessThan(0.01)) return ''
    if (_amount.isLessThan(1)) return `${_amount.toFixed(2)} ${symbol}`
    if (_amount.isLessThan(1e3)) return `${_amount.toFixed(1)} ${symbol}`
    if (_amount.isLessThan(1e6)) return `${_amount.div(1e6).toFixed(1)}K ${symbol}`
    return `${_amount.div(1e6).toFixed(1)}M ${symbol}`
}

export function formatText(name: string, tokenId: string) {
    const _name = name.replace(/#\d*/, '').trim()
    const __name = `${_name} #${tokenId}`
    if (__name.length > 28) return `${__name.slice(0, 28)}...`
    return __name
}

export function formatTokenId(symbol: string, tokenId: string) {
    const name = tokenId
    return name.length > 18 ? name.slice(0, 12) + '...' : name
}

export function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 20) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

export async function getNFTAvatarByUserId(userId: string, avatarId: string): Promise<NextIDAvatarMeta | undefined> {
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(platform, userId)

    for (const binding of bindings.sort((a, b) => sortPersonaBindings(a, b, userId))) {
        // TODO: replace to Storage
        const response = await NextIDStorage.getByIdentity<NextIDAvatarMeta>(
            binding.persona,
            platform,
            userId.toLowerCase(),
            PLUGIN_ID,
        )
        if (!avatarId && response.ok) return response.val
        if (response.ok && response.val?.avatarId === avatarId) return response.val
    }
    return
}
