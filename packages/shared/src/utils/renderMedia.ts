const MEDIA_VIEWER_PREFIX = 'https://dimensiondev.github.io/Media-Viewer/index.html?url='

export function renderMedia(url: string | undefined) {
    if (!url) return
    if (url.startsWith(MEDIA_VIEWER_PREFIX)) return url
    return MEDIA_VIEWER_PREFIX + encodeURIComponent(url)
}
