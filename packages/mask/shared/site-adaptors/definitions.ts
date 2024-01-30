import { FacebookAdaptor } from './implementations/facebook.com.js'
import { InstagramAdaptor } from './implementations/instagram.com.js'
import { MindsAdaptor } from './implementations/minds.com.js'
import { MirrorAdaptor } from './implementations/mirror.xyz.js'
import { TwitterAdaptor } from './implementations/twitter.com.js'
import type { SiteAdaptor } from './types.js'

const defined = new Map<string, SiteAdaptor.Definition>()
export const definedSiteAdaptors: ReadonlyMap<string, SiteAdaptor.Definition> = defined

function defineSiteAdaptor(UI: SiteAdaptor.Definition) {
    defined.set(UI.networkIdentifier, UI)
}
defineSiteAdaptor(FacebookAdaptor)
defineSiteAdaptor(InstagramAdaptor)
defineSiteAdaptor(MindsAdaptor)
defineSiteAdaptor(MirrorAdaptor)
defineSiteAdaptor(TwitterAdaptor)

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
