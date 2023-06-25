export function formatPublicKey(publicKey?: string) {
    if (!publicKey) return ''
    return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
}
