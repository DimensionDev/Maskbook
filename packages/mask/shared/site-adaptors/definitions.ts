import { FacebookAdaptor } from './implementations/facebook.com.js'
import { FarcasterAdaptor } from './implementations/farcaster.xyz.js'
import { LensAdaptor } from './implementations/hey.xyz.js'
import { InstagramAdaptor } from './implementations/instagram.com.js'
import { MindsAdaptor } from './implementations/minds.com.js'
import { MirrorAdaptor } from './implementations/mirror.xyz.js'
import { TwitterAdaptor } from './implementations/twitter.com.js'
import type { SiteAdaptor } from './types.js'

export const definedSiteAdaptors: ReadonlyMap<string, SiteAdaptor.Definition> = new Map<string, SiteAdaptor.Definition>(
    [
        [FacebookAdaptor.networkIdentifier, FacebookAdaptor],
        [InstagramAdaptor.networkIdentifier, InstagramAdaptor],
        [MindsAdaptor.networkIdentifier, MindsAdaptor],
        [MirrorAdaptor.networkIdentifier, MirrorAdaptor],
        [TwitterAdaptor.networkIdentifier, TwitterAdaptor],
        [FarcasterAdaptor.networkIdentifier, FarcasterAdaptor],
        [LensAdaptor.networkIdentifier, LensAdaptor],
    ],
)

function matches(url: string, pattern: string) {
    const l = new URL(pattern)
    const r = new URL(url)

    // https://example.com/
    if (l.origin === r.origin) return true

    // https://*.example.com/
    if (l.hostname.startsWith('%2A.')) {
        if (l.protocol !== r.protocol) return false
        // subdomain.example.com
        if (r.hostname.endsWith(l.hostname.slice(3))) return true
        // example.com
        if (r.hostname === l.hostname.slice(4)) return true
    }
    return false
}
export function matchesAnySiteAdaptor(url: string) {
    return Array.from(definedSiteAdaptors.values()).some((x) =>
        x.declarativePermissions.origins.some((x) => matches(url, x)),
    )
}
