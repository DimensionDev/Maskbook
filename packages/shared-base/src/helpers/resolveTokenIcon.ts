interface Options {
    address: string
    chainId?: number
    size?: number
}
/**
 * Resolves the token icon URL, includes FungibleToken and NonFungibleToken
 */
export function resolveTokenIcon({ address, chainId, size }: Options) {
    return `https://stamp.firefly.land/${chainId ? `${chainId}/` : ''}logo/${address}${size ? `?size=${size}` : ''}`
}
