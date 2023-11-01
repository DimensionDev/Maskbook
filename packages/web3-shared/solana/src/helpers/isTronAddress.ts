export function isTronAddress(address: string): boolean {
    return /^T[1-9A-HJ-NP-Za-km-z]{32,42}$|^T9[1-9A-HJ-NP-Za-km-z]{32,41}$/.test(address)
}
