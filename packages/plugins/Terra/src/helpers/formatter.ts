export function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 44) return address
    return `${address.substr(0, 4 + size)}...${address.substr(-size)}`
}
