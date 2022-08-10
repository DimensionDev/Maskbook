import Services from '../extension/service'

const { fetch: original_fetch } = globalThis
export function contentFetch(input: RequestInfo, init?: RequestInit) {
    const info = new Request(input, init)

    if (canAccessAsContent(info.url)) {
        if (process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object') {
            return content.fetch(info, init)
        } else {
            return original_fetch(info, init)
        }
    }

    const signal = init?.signal
    if (init) delete init.signal
    return Services.Helper.r2d2Fetch(info, init).then((response) => {
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
    if (extensionOrigin === target.origin) return true
    return target.origin === location.origin
}
