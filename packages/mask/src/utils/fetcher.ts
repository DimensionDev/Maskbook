import Services from '../extension/service'

const { fetch: original_fetch } = globalThis
export function contentFetch(input: RequestInfo, init?: RequestInit) {
    const info = new Request(input, init)

    if (canAccessAsContent(info.url)) {
        if (process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object') {
            return content.fetch(info)
        } else {
            return original_fetch(info)
        }
    }

    return Services.Helper.r2d2Fetch(info)
}

const extensionOrigin = (() => {
    try {
        return new URL(browser.runtime.getURL('')).origin
    } catch (e) {
        return null
    }
})()

function canAccessAsContent(url: string) {
    const target = new URL(url, location.href)
    if (location.origin.endsWith('twitter.com') && target.origin === 'https://abs.twimg.com') return true
    if (extensionOrigin === target.origin) return true
    return target.origin === location.origin
}
