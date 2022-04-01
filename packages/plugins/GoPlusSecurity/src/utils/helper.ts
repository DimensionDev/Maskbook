import urlcat from 'urlcat'

export function resolveGoLabLink(chainId: string, address: string) {
    return urlcat('https://gopluslabs.io/token-security/:chainId/:address', { chainId, address })
}
