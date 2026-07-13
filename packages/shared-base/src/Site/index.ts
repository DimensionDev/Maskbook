import { getEnumAsArray } from '@masknet/kit'
import { Sniffings } from '../Sniffings/index.js'
import { ExtensionSite, EnhanceableSite } from './types.js'

const matchEnhanceableSiteHost: Record<EnhanceableSite, RegExp> = {
    [EnhanceableSite.Localhost]: /^localhost$/iu,
    [EnhanceableSite.Facebook]: /(^|\.)facebook\.com$/iu,
    [EnhanceableSite.Twitter]: /(^|\.)(twitter|x)\.com$/iu,
    [EnhanceableSite.Minds]: /(^|\.)minds\.com$/iu,
    [EnhanceableSite.Instagram]: /(^|\.)instagram\.com$/iu,
    [EnhanceableSite.OpenSea]: /(^|\.)opensea\.io$/iu,
    [EnhanceableSite.Firefly]:
        process.env.NODE_ENV === 'production' ?
            /(?:^(?:firefly\.|firefly-staging\.|firefly-canary\.)?mask\.social|[\w-]+\.vercel\.app)$/iu
        :   /^localhost:\d+$/u,
}

const matchExtensionSitePathname: Record<ExtensionSite, RegExp> = {
    [ExtensionSite.Dashboard]: /dashboard\.html/iu,
    [ExtensionSite.Popup]: /popups\.html/iu,
    [ExtensionSite.Swap]: /swap\.html/iu,
}

export const EnhanceableSiteList = getEnumAsArray(EnhanceableSite).map((x) => x.value)
export const ExtensionSiteList = getEnumAsArray(ExtensionSite).map((x) => x.value)

export function getEnhanceableSiteType() {
    const target = location.host
    for (const [type, regexp] of Object.entries(matchEnhanceableSiteHost)) {
        if (regexp.test(target)) return type as EnhanceableSite
    }
    return
}

export function getExtensionSiteType() {
    if (!location.protocol.includes('extension')) return
    const target = location.pathname
    for (const [type, regexp] of Object.entries(matchExtensionSitePathname)) {
        if (regexp.test(target)) return type as ExtensionSite
    }
    return
}

export function getSiteType() {
    return getEnhanceableSiteType() ?? getExtensionSiteType()
}

export function getAgentType() {
    if (Sniffings.is_edge) return 'edge'
    if (Sniffings.is_opera) return 'opera'
    if (Sniffings.is_firefox) return 'firefox'
    if (Sniffings.is_chromium) return 'chromium'
    return 'unknown'
}

export function isEnhanceableSiteType() {
    return !!getEnhanceableSiteType()
}

export function isExtensionSiteType() {
    return !!getExtensionSiteType()
}

/**
 * The metamask browser provider is available in the page.
 * @returns
 */
export function isEthereumInjected(name = 'ethereum') {
    if (typeof window === 'undefined') return false

    return Reflect.get(window, name) !== undefined
}

/**
 * The metamask browser provider (for extension's content page) is available in the page.
 * @returns
 */
export function isInPageEthereumInjected() {
    return !isExtensionSiteType() && !Sniffings.is_firefox
}

export function getExtensionId(): string | undefined {
    try {
        if (Sniffings.is_chromium || Sniffings.is_opera || Sniffings.is_edge) {
            // @ts-expect-error this package should not access browser global. It makes this package non-portable.
            return browser.runtime.getURL('').match(/chrome-extension:\/\/([a-z]{32})/u)?.[1] ?? ''
        }
    } catch {
        // in case browser does not exist
    }
    return
}
