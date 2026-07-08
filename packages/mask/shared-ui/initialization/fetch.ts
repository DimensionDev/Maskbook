import Services from '#services'
import { isDomainOrSubdomainOf } from '@masknet/shared-base'

import.meta.webpackHot?.accept()

const { fetch: original_fetch } = globalThis

function contentFetch(input: RequestInfo | URL, init?: RequestInit) {
    const request = new Request(input, init)

    if (shouldAccessViaContent(request.url)) {
        return original_fetch(request, init)
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

function fetchingTwitterResource(target: URL) {
    return (
        (isDomainOrSubdomainOf(location.href, 'twitter.com') || isDomainOrSubdomainOf(location.href, 'x.com')) &&
        (isDomainOrSubdomainOf(target.href, 'twitter.com') ||
            isDomainOrSubdomainOf(target.href, 'x.com') ||
            isDomainOrSubdomainOf(target.href, 'twimg.com'))
    )
}

function fetchingInsResource(target: URL) {
    // cspell:disable-next-line
    if (isHostName(location, 'instagram.com') && target.origin.match(/(fbcdn\.net|cdninstagram\.com)$/u)) return true
    return target.host === 'api.lens.xyz'
}

function fetchingGoogleDriveResource(target: URL) {
    return target.origin === 'https://www.googleapis.com'
}

function shouldAccessViaContent(url: string) {
    const target = new URL(url, location.href)
    if (fetchingTwitterResource(target) || fetchingInsResource(target) || fetchingGoogleDriveResource(target))
        return true

    // eg: https://maskbook-backup-server-staging.s3.ap-east-1.amazonaws.com/backups/xxx.zip
    // The content-length needs to be used in the client request in order to realize the progress of the download.
    if (target.origin.includes('maskbook-backup')) return true
    // aws s3
    if (isDomainOrSubdomainOf(url, 'amazonaws.com') && url.includes('x-id=PutObject')) return true
    if (extensionOrigin === target.origin) return true
    return target.origin === location.origin
}

function isHostName(url: URL | Location, domain: string) {
    // either example.com or *.example.com
    return url.hostname === domain || url.hostname.endsWith('.' + domain)
}

globalThis.fetch = contentFetch
