import { ideaMarketHostnames, ideaMarketPathnameRegexMatcher } from './constants'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)

    return ideaMarketHostnames.includes(_url.hostname) && ideaMarketPathnameRegexMatcher.test(_url.pathname)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)

    const ideaMarketMatched = _url.pathname.match(ideaMarketPathnameRegexMatcher)

    if (ideaMarketMatched) {
        return {
            market_name: ideaMarketMatched[1],
            idea_name: ideaMarketMatched[2],
        }
    }

    // nothing matched
    return
}

export const formatterToUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})
