export function parseURL(url: string | undefined) {
    if (!url) return
    try {
        return new URL(url)
    } catch {
        return
    }
}
