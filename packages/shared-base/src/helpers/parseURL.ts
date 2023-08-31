export function parseURL(url: string | undefined) {
    if (!url || !URL.canParse(url)) return
    return new URL(url)
}
