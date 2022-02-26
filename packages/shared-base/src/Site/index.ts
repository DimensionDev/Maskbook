import { EnhanceableSite, ExtensionSite } from './type'

export * from './type'

const { host, pathname } = location

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
    [ExtensionSite.Popup]: /popup\.html/i,
}

function getEnhanceableSiteType() {
    for (const [type, regexp] of Object.entries(matchEnhanceableSiteHost)) {
        if (host.match(regexp)) return type as EnhanceableSite
        continue
    }
    return
}

function getExtensionSiteType() {
    for (const [type, regexp] of Object.entries(matchExtensionSitePathname)) {
        if (pathname.match(regexp)) return type as ExtensionSite
        continue
    }
    return
}

export function getSiteType() {
    return getEnhanceableSiteType() ?? getExtensionSiteType()
}
