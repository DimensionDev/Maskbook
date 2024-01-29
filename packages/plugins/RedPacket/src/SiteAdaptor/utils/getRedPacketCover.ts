import urlcat from 'urlcat'

interface Options {
    theme: 'mask' | 'golden-flower' | 'lucky-flower' | 'lucky-firefly' | 'co-branding'
    symbol: string
    shares: number | string
    amount: number | string
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
