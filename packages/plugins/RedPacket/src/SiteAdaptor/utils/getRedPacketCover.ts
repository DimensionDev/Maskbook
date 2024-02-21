import urlcat from 'urlcat'

interface Options {
    themeId: string
    symbol: string
    shares: number | string
    amount: number | string
    decimals?: number
    from: string
    message: string
    'remaining-amount': number | string
    'remaining-shares': number | string
}

export function getRedPacketCover(options: Options) {
    return urlcat('https://firefly-staging.mask.social/api/rp', {
        usage: 'cover',
        ...options,
    })
}
