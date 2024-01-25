import urlcat from 'urlcat'

// TODO
export function getRedPacketCover() {
    return urlcat('https://firefly-staging.mask.social/api/rp', {
        usage: 'cover',
        theme: 'lucky-flower',
        size: 100,
        shares: 3,
        amount: 10,
        from: 'bob',
        message: 'Greeting',
        remainingAmount: 2,
        remainingShares: 2,
        symbol: 'UDST',
    })
}
