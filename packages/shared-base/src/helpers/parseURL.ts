export function parseURL(url: string) {
    if (!URL.canParse(url)) return
    return new URL(url)
}
