export function formatHash(hash: string, size = 0) {
    if (hash.length <= 2 * size + 2) return hash
    return `${hash.slice(0, Math.max(0, 2 + size))}...${hash.slice(-size)}`
}
