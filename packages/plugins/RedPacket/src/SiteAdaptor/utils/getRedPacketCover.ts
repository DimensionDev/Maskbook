import urlcat from 'urlcat'

interface Options {
    theme: string
    symbol: string
    shares: number | string
    amount: number | string
    decimals?: number
    from: string
    message: string
    remainingAmount: number | string
    remainingShares: number | string
}

export function getRedPacketCover(options: Options) {
    return urlcat('https://firefly-staging.mask.social/api/rp', {
        usage: 'cover',
        ...options,
    })
}
