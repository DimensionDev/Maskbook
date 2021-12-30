export function getHostPermissionFieldFromURL(url: string) {
    const u = new URL(url)
    return `*://${u.hostname}/*`
}
export function isValidURL(url: string): boolean {
    try {
        const u = new URL(url)
        return u.protocol.startsWith('http')
    } catch {
        return false
    }
}
