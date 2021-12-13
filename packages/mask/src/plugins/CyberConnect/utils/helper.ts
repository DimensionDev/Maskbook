export function shortenAddress(address?: string, length: number = 16): string {
    if (!address) {
        return ''
    }
    if (address.length < length) {
        return address
    }
    const arr = address.split('')
    const startIdx = Math.ceil(length / 2)

    arr.splice(startIdx, arr.length - length, '...')
    return arr.join('')
}
