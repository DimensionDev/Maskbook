export function formatAddress(address: string, size = 0) {
    if (!/0x\w{16}/.test(address)) return address
    if (size === 0 || size >= 8) return address
    return `${address.slice(0, 2 + size)}...${address.slice(-size)}`
}
