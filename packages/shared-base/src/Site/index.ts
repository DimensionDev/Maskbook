import { getEnumAsArray } from '@masknet/kit'
import { Sniffings } from '../Sniffings/index.js'
import { ExtensionSite, EnhanceableSite } from './types.js'
import { parseURL } from '../helpers/parseURL.js'

const matchEnhanceableSiteHost: Record<EnhanceableSite, RegExp> = {
    [EnhanceableSite.Localhost]: /localhost/i,
    [EnhanceableSite.App]:
        process.env.NODE_ENV === 'production'
            ? /^(app\.mask\.io|app-(beta|stage|test)\.mask\.io|[\w-]*\.?maskbook\.pages\.dev)$/i
            : /localhost/,
    [EnhanceableSite.Facebook]: /facebook\.com/i,
    [EnhanceableSite.Twitter]: /twitter\.com/i,
    [EnhanceableSite.Minds]: /minds\.com/i,
    [EnhanceableSite.Instagram]: /instagram\.com/i,
    [EnhanceableSite.OpenSea]: /opensea\.io/i,
    [EnhanceableSite.Mirror]: /mirror\.xyz/i,
}

const matchExtensionSitePathname: Record<ExtensionSite, RegExp> = {
    [ExtensionSite.Dashboard]: /dashboard\.html/i,
    [ExtensionSite.Popup]: /popups\.html/i,
}

export const EnhanceableSiteList = getEnumAsArray(EnhanceableSite).map((x) => x.value)
export const ExtensionSiteList = getEnumAsArray(ExtensionSite).map((x) => x.value)

export function getEnhanceableSiteType(url?: string) {
    const target = parseURL(url)?.host ?? location.host
    for (const [type, regexp] of Object.entries(matchEnhanceableSiteHost)) {
        if (target.match(regexp)) return type as EnhanceableSite
        continue
    }
    return
}

export function getExtensionSiteType(url?: string) {
    const target = parseURL(url)?.pathname ?? location.pathname
    for (const [type, regexp] of Object.entries(matchExtensionSitePathname)) {
        if (target.match(regexp)) return type as ExtensionSite
        continue
    }
    return
}

export function getSiteType(url?: string) {
    return getEnhanceableSiteType(url) ?? getExtensionSiteType(url)
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
    return typeof Reflect.get(window, name) !== 'undefined'
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
            return browser.runtime.getURL('').match(/chrome-extension:\/\/([a-z]{32})/)?.[1] ?? ''
        }
    } catch {
        // in case browser does not exist
    }
    return
}
