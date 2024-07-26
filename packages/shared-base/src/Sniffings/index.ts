const navigator_ = typeof navigator === 'undefined' ? null : navigator

const isChromium = navigator_?.userAgent.includes('Chrome') || navigator_?.userAgent.includes('Chromium')

export const Sniffings = {
    is_opera: navigator_?.userAgent.includes('OPR/'),
    is_edge: navigator_?.userAgent.includes('Edg'),
    is_firefox: navigator_?.userAgent.includes('Firefox'),
    is_chromium: isChromium,
    is_safari: !isChromium && navigator_?.userAgent.includes('Safari'),
}
