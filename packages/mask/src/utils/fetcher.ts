import { EnhanceableSite } from '@masknet/shared-base'
import Services from '../extension/service.js'

const { fetch: original_fetch } = globalThis

export function contentFetch(input: RequestInfo, init?: RequestInit) {
    const request = new Request(input, init)

    if (canAccessAsContent(request.url)) {
        if (
            navigator.userAgent.includes('Firefox') &&
            browser.runtime.getManifest().manifest_version === 2 &&
            typeof content === 'object'
        ) {
            return content.fetch(request, init)
        } else {
            return original_fetch(request, init)
        }
    }

    const signal = init?.signal
    if (init) delete init.signal

    return Services.Helper.fetchGlobal(request, init).then((response) => {
        signal?.throwIfAborted()
        return response
    })
}

const extensionOrigin = (() => {
    try {
        return new URL(browser.runtime.getURL('')).origin
    } catch {
        return null
    }
})()

function canAccessAsContent(url: string) {
    const target = new URL(url, location.href)
    if (
        location.origin.endsWith('twitter.com') &&
        ['https://abs.twimg.com', 'https://upload.twitter.com'].includes(target.origin)
    )
        return true

    if (location.origin.endsWith(EnhanceableSite.Mirror) && target.origin.endsWith('mirror-api.com')) return true
    if (extensionOrigin === target.origin) return true
    return target.origin === location.origin
}
