import { EnhanceableSite, ExtensionSite } from './type'

export * from './type'

const matchEnhanceableSiteHost: Record<EnhanceableSite, RegExp> = {
    [EnhanceableSite.Localhost]: /localhost/i,
    [EnhanceableSite.Facebook]: /facebook\.com/i,
    [EnhanceableSite.Twitter]: /twitter\.com/i,
    [EnhanceableSite.Minds]: /minds\.com/i,
    [EnhanceableSite.Instagram]: /instagram\.com/i,
    [EnhanceableSite.OpenSea]: /opensea\.io/i,
}

const matchExtensionSitePathname: Record<ExtensionSite, RegExp> = {
    [ExtensionSite.Dashboard]: /dashboard\.html/i,
    [ExtensionSite.Popup]: /popups\.html/i,
}

function getEnhanceableSiteType() {
    const { host } = location
    for (const [type, regexp] of Object.entries(matchEnhanceableSiteHost)) {
        if (host.match(regexp)) return type as EnhanceableSite
        continue
    }
    return
}

function getExtensionSiteType() {
    const { pathname } = location
    for (const [type, regexp] of Object.entries(matchExtensionSitePathname)) {
        if (pathname.match(regexp)) return type as ExtensionSite
        continue
    }
    return
}

export function getSiteType() {
    return getEnhanceableSiteType() ?? getExtensionSiteType()
}

export function isEnhanceableSiteType() {
    return !!getEnhanceableSiteType()
}

export function isExtensionSiteType() {
    return !!getExtensionSiteType()
}

export function isFirefox() {
    return process.env.engine === 'firefox'
}

export function isEthereumInjected() {
    return !isExtensionSiteType() && !isFirefox()
}
