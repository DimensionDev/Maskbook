const FRAME_SERVER_URL = 'https://polls.firefly.social'

import { safeUnreachable } from '@masknet/kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import { FireflyFarcasterAPI, Social } from '@masknet/web3-providers/types'
import urlcat from 'urlcat'
import { parseUrl } from './url.js'

export function isSameOriginUrl(source: string | URL, target: string | URL) {
    const sourceUrl = typeof source === 'string' ? parseUrl(source) : source
    const targetUrl = typeof target === 'string' ? parseUrl(target) : target

    if (!sourceUrl || !targetUrl) return false

    return sourceUrl.origin === targetUrl.origin
}

export function isRoutePathname(pathname: string, routePathname: `/${string}`, exact = false) {
    // Check if both pathnames start with '/'
    if (!pathname.startsWith('/') || !routePathname.startsWith('/')) {
        return false
    }

    // Remove trailing '/' from, if present and split the pathnames into parts
    const pathnameParts = pathname.replace(/\/$/, '').split('/')
    const routePathnameParts = routePathname.replace(/\/$/, '').split('/')

    // In exact mode, check if the number of parts in both pathnames are equal
    if (exact && routePathnameParts.length !== pathnameParts.length) {
        return false
    }

    // Check if the number of parts in routePathname is less than or equal to pathname
    if (routePathnameParts.length > pathnameParts.length) {
        return false
    }

    // Check if the parts in routePathname are in the same sequence as in pathname
    for (let i = 0; i < routePathnameParts.length; i += 1) {
        const part = routePathnameParts[i]
        if (part.startsWith(':') && !!pathnameParts[i]) continue
        if (routePathnameParts[i] !== pathnameParts[i]) {
            return false
        }
    }

    // If all checks pass, the pathnames are considered identical
    return true
}

export function getResourceType(urlString: string) {
    const parsedURL = parseUrl(urlString)
    if (!parsedURL) return

    let fileExtension = parsedURL?.pathname.split('.').pop()?.toLowerCase()
    if (!fileExtension) return

    // TODO Temporary solution for https://mask.atlassian.net/browse/FW-755
    if (['imagedelivery.net'].includes(parsedURL.hostname)) {
        return 'Image'
    }

    // cspell: disable-next-line
    if (['supercast.mypinata.cloud', 'cloudflare-ipfs.com'].includes(parsedURL.hostname)) {
        const fileName = parsedURL.searchParams.get('filename')
        const extension = fileName?.split('.').pop()?.toLowerCase()
        if (extension) fileExtension = extension
    }

    if (['png', 'jpeg', 'gif', 'webp', 'bmp', 'jpg'].includes(fileExtension)) {
        return 'Image'
    } else if (['mp4', 'webm', 'ogg', 'm3u8', 'mov'].includes(fileExtension)) {
        return 'Video'
    } else if (['mp3'].includes(fileExtension)) {
        return 'Audio'
    } else if (isValidPollFrameUrl(parsedURL.origin)) {
        return 'Poll'
    } else {
        return
    }
}

const frameDomains = [FRAME_SERVER_URL, 'https://polls-canary.firefly.social', 'https://polls.mask.social']

export function isValidPollFrameUrl(url: string): boolean {
    if (!frameDomains.some((domain) => isSameOriginUrl(url, domain))) return false
    const parsed = parseUrl(url)
    if (!parsed) return false

    return isRoutePathname(parsed.pathname, '/polls/:id', true)
}

export function resolveEmbedMediaType(url: string, type?: FireflyFarcasterAPI.EmbedMediaType) {
    if (!type) return getResourceType(url)

    switch (type) {
        case FireflyFarcasterAPI.EmbedMediaType.IMAGE:
            return 'Image'
        case FireflyFarcasterAPI.EmbedMediaType.AUDIO:
            if (url.includes('m3u8')) return 'Video'
            return 'Audio'
        case FireflyFarcasterAPI.EmbedMediaType.VIDEO:
            return 'Video'
        case FireflyFarcasterAPI.EmbedMediaType.UNKNOWN:
            return 'Unknown'
        default:
            if (isValidPollFrameUrl(url)) return 'Poll'
            return
    }
}

const getPollFrameSearchParams = (source: Social.SocialSource) => {
    return {
        source: source.toLowerCase(),
        profileId: null,
        theme: 'dark',
        locale: 'en-US',
        date: Date.now(), // force refresh poll frame
    }
}

export const composePollFrameUrl = (url: string, source: Social.SocialSource) => {
    const parsed = parseUrl(url)
    if (!parsed) return url
    Object.entries(getPollFrameSearchParams(source)).forEach(([key, value]) => {
        if (value) parsed.searchParams.set(key, value.toString())
    })
    return parsed.toString()
}

export function getPollFrameUrl(pollId: string, source?: Social.SocialSource, author?: Social.Profile) {
    const profile = author
    console.log('author', profile ? getProfileUrl(profile) : null, typeof profile)
    console.log('handle', profile?.handle)
    console.log('source', source)

    return urlcat(FRAME_SERVER_URL, `/polls/${pollId}`, {
        author: profile ? getProfileUrl(profile) : null,
        handle: profile?.handle,
        source: source?.toLowerCase(),
    })
}

export function getProfileUrl(profile: Social.Profile) {
    switch (profile.source) {
        case Social.Source.Lens:
            if (!profile.handle) return ''
            return resolveProfileUrl(profile.source, profile.handle)
        case Social.Source.Farcaster:
            if (!profile.profileId) return ''
            return resolveProfileUrl(profile.source, profile.profileId)
        default:
            safeUnreachable(profile.source)
            return ''
    }
}

export function resolveProfileUrl(source: Social.Source, handle?: string, category?: string) {
    if (!handle && !category) {
        return urlcat('/profile/:source', {
            source: resolveSourceInUrl(source),
        })
    }
    return urlcat('/profile/:source/:handle', {
        handle,
        source: resolveSourceInUrl(source),
    })
}

export const resolveSourceInUrl = createLookupTableResolver<Social.Source, Social.SourceInURL>(
    {
        [Social.Source.Farcaster]: Social.SourceInURL.Farcaster,
        [Social.Source.Lens]: Social.SourceInURL.Lens,
    },
    (source) => {
        throw new Error(`Unreachable source = ${source}.`)
    },
)

export const resolveSocialSourceInUrl = createLookupTableResolver<Social.SocialSource, Social.SourceInURL>(
    {
        [Social.Source.Farcaster]: Social.SourceInURL.Farcaster,
        [Social.Source.Lens]: Social.SourceInURL.Lens,
    },
    (source) => {
        throw new Error(`Unreachable source = ${source}.`)
    },
)
