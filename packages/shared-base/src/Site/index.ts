import { getEnumAsArray } from '@masknet/kit'
import { Sniffings } from '../Sniffings/index.js'
import { ExtensionSite, EnhanceableSite } from './types.js'

const matchEnhanceableSiteHost: Record<EnhanceableSite, RegExp> = {
    [EnhanceableSite.Localhost]: /^localhost$/i,
    [EnhanceableSite.Facebook]: /(^|\.)facebook\.com$/i,
    [EnhanceableSite.Twitter]: /(^|\.)twitter\.com$/i,
    [EnhanceableSite.Minds]: /(^|\.)minds\.com$/i,
    [EnhanceableSite.Instagram]: /(^|\.)instagram\.com$/i,
    [EnhanceableSite.OpenSea]: /(^|\.)opensea\.io$/i,
    [EnhanceableSite.Mirror]: /(^|\.)mirror\.xyz$/i,
    [EnhanceableSite.Firefly]:
        process.env.NODE_ENV === 'production' ?
            /(?:^(?:firefly\.|firefly-staging\.|firefly-canary\.|beta\.|alpha\.)?mask\.social|[\w-]+\.vercel\.app)$/i
        :   /^localhost:\d+$/,
}

export const EnhanceableSiteList = getEnumAsArray(EnhanceableSite).map((x) => x.value)
export const ExtensionSiteList = getEnumAsArray(ExtensionSite).map((x) => x.value)

export function getEnhanceableSiteType() {
    const target = location.host
    for (const [type, regexp] of Object.entries(matchEnhanceableSiteHost)) {
        if (target.match(regexp)) return type as EnhanceableSite
        continue
    }
    return
}

export function getSiteType() {
    return getEnhanceableSiteType()
}

export function getAgentType() {
    if (Sniffings.is_edge) return 'edge'
    if (Sniffings.is_opera) return 'opera'
    if (Sniffings.is_firefox) return 'firefox'
    if (Sniffings.is_chromium) return 'chromium'
    return 'unknown'
}

/**
 * The metamask browser provider is available in the page.
 * @returns
 */
export function isEthereumInjected(name = 'ethereum') {
    if (typeof window === 'undefined') return false
    return typeof Reflect.get(window, name) !== 'undefined'
}

/**
 * The metamask browser provider (for extension's content page) is available in the page.
 * @returns
 */
export function isInPageEthereumInjected() {
    return !Sniffings.is_firefox
}

export function getExtensionId(): string | undefined {
    try {
        if (Sniffings.is_chromium || Sniffings.is_opera || Sniffings.is_edge) {
            // @ts-expect-error this package should not access browser global. It makes this package non-portable.
            return browser.runtime.getURL('').match(/chrome-extension:\/\/([a-z]{32})/)?.[1] ?? ''
        }
    } catch {
        // in case browser does not exist
    }
    return
}
