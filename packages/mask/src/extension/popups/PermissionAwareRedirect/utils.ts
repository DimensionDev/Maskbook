export function getHostPermissionFieldFromURL(url: string) {
    const u = new URL(url)
    return `*://${u.hostname}/*`
}
export function isValidURL(url: string): boolean {
    if (!URL.canParse(url)) return false
    const u = new URL(url)
    return u.protocol.startsWith('http')
}
