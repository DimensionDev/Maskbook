export function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 22) return address
    return `${address.substr(0, 2 + size)}...${address.substr(-size)}`
}
