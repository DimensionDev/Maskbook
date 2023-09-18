import Services from '#services'

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

    // eg: https://maskbook-backup-server-staging.s3.ap-east-1.amazonaws.com/backups/xxx.zip
    // The content-length needs to be used in the client request in order to realize the progress of the download.
    if (target.origin.includes('maskbook-backup')) return true
    if (isHostName(location, 'mirror.xyz') && isHostName(target, 'mirror-api.com')) return true
    if (extensionOrigin === target.origin) return true
    return target.origin === location.origin
}

function isHostName(url: URL | Location, domain: string) {
    // either example.com or *.example.com
    return url.hostname === domain || url.hostname.endsWith('.' + domain)
}
