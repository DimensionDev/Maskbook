import { first, isNull } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import {
    attemptUntil,
    fetchImageViaDOM,
    fetchImageViaHTTP,
    isLocaleResource,
    resolveCrossOriginURL,
    resolveResourceURL,
} from '@masknet/web3-shared-base'
import { EnhanceableSite, type NextIDPersonaBindings, NextIDPlatform, getSiteType } from '@masknet/shared-base'
import { NextIDProof, NextIDStorageProvider } from '@masknet/web3-providers'
import type { NextIDAvatarMeta } from '../types.js'
import { PLUGIN_ID } from '../constants.js'
import { fetchBlob } from '@masknet/web3-providers/helpers'

export async function getImage(image: string): Promise<string> {
    const blob = await fetchBlob(image)
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
    const resolvedURL = resolveCrossOriginURL(url)
    if (!resolvedURL) return fetchImageViaHTTP(url)
    return attemptUntil(
        [
            async () => fetchImageViaHTTP(url),
            async () => fetchImageViaDOM(resolvedURL),
            async () => fetchImageViaHTTP(resolvedURL),
        ],
        null,
    )
}

export async function toPNG(image: string) {
    const isBase64 = isLocaleResource(image)
    const resolvedURL = resolveResourceURL(image)
    const imageData = await fetchImage(resolvedURL || image)
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
        if (!isBase64 && imageData) img.src = URL.createObjectURL(imageData)
        else img.src = image
    })
}

export function formatPrice(amount: string, symbol: string) {
    const _amount = new BigNumber(amount ?? '0')
    if (_amount.isZero() || _amount.isLessThan(0.01)) return ''
    if (_amount.isLessThan(1)) return `${_amount.toFixed(2)} ${symbol}`
    if (_amount.isLessThan(1000)) return `${_amount.toFixed(1)} ${symbol}`
    if (_amount.isLessThan(1000000)) return `${_amount.div(1000000).toFixed(1)}K ${symbol}`
    return `${_amount.div(1000000).toFixed(1)}M ${symbol}`
}

export function formatText(name: string, tokenId: string) {
    return name.length > 28 ? `${name.slice(0, 28)}...` : name
}

export function formatTokenId(symbol: string, tokenId: string) {
    const name = tokenId
    return name.length > 18 ? name.slice(0, 12) + '...' : name
}

export function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 20) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

async function getAvatarFromNextIDStorage(
    persona: string,
    platform: NextIDPlatform,
    userId: string,
    avatarId?: string,
) {
    const response = await NextIDStorageProvider.getByIdentity<NextIDAvatarMeta>(
        persona,
        platform,
        userId.toLowerCase(),
        PLUGIN_ID,
    )

    if (!avatarId && response.ok) return response.val
    if (response.ok && response.val?.avatarId === avatarId) return response.val
    return
}

/**
 * find latest used persona binding
 */

export const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId?: string): number => {
    if (!userId) return 0

    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.last_checked_at > p_b.last_checked_at) return -1
    return 1
}

export async function getNFTAvatarByUserId(
    userId: string,
    avatarId: string,
    persona: string,
): Promise<NextIDAvatarMeta | undefined> {
    const platform = getSiteType() === EnhanceableSite.Twitter ? NextIDPlatform.Twitter : undefined
    if (!platform) return
    const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(platform, userId)

    if (persona) {
        const binding = bindings.filter((x) => x.persona.toLowerCase() === persona.toLowerCase())?.[0]
        if (binding) {
            return getAvatarFromNextIDStorage(binding.persona, platform, userId, avatarId)
        }
    }
    for (const binding of bindings.sort((a, b) => sortPersonaBindings(a, b, userId))) {
        const avatar = await getAvatarFromNextIDStorage(binding.persona, platform, userId, avatarId)
        if (avatar) return avatar
    }
    return
}
