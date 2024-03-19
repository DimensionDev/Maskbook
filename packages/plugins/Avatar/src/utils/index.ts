import { BigNumber } from 'bignumber.js'
import {
    attemptUntil,
    fetchImageViaDOM,
    fetchImageViaHTTP,
    resolveCrossOriginURL,
    resolveResourceURL,
} from '@masknet/web3-shared-base'

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

export async function toPNG(url: string) {
    const resolvedURL = resolveResourceURL(url) || url

    const imageData = await fetchImage(resolvedURL)
    if (imageData) return imageData

    return new Promise<Blob | null>((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas was not supported')

        const image = new Image()

        image.addEventListener('load', () => {
            canvas.width = image.width
            canvas.height = image.height
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })
        image.addEventListener('error', () => {
            reject(new Error('Could not load image'))
        })
        image.setAttribute('CrossOrigin', 'Anonymous')
        image.src = url
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
