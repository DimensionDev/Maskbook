type WindowTarget = LiteralUnion<'_top' | '_self' | '_parent' | '_blank'>

interface BehaviorFlags {
    popup?: boolean
    toolbar?: boolean
    status?: boolean
    resizable?: boolean
    scrollbars?: boolean
}

interface WindowFeatureFlags {
    // Behavior
    opener?: boolean
    referrer?: boolean
    behaviors?: BehaviorFlags
    // Dimension
    width?: number
    height?: number
    screenX?: number
    screenY?: number
}

export function openWindow(
    url: string | URL | undefined | null,
    target: WindowTarget = '_blank',
    features: WindowFeatureFlags = {},
): Window | null {
    if (!url) return null
    const flags = []
    for (const [name, value] of Object.entries(features.behaviors ?? {})) {
        if (value) flags.push(`${name}=1`)
    }
    if (!features.opener) flags.push('noopener')
    if (!features.referrer) flags.push('noreferrer')
    if (Number.isFinite(features.width)) flags.push(`width=${features.width}`)
    if (Number.isFinite(features.height)) flags.push(`height=${features.height}`)
    if (Number.isFinite(features.screenX)) flags.push(`screenX=${features.screenX}`)
    if (Number.isFinite(features.screenY)) flags.push(`screenY=${features.screenY}`)
    return window.open(url, target, flags.join(' '))
}
