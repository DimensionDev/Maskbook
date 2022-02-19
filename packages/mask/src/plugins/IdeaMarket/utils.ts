import { ideaMarketPathnameRegexMatcher } from './constants'

export function checkUrl(url: string): boolean {
    // const protocol = 'https://'
    // const _url = new URL(url.startsWith(protocol) ? url : protocol + url)
    return url.includes('ideamarket.io')

    // return ideaMarketHostnames.includes(_url.hostname)
    //  && ideaMarketPathnameRegexMatcher.test(_url.pathname)
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

export function formatSymbol(symbol: string) {
    return symbol.length > 60 ? symbol.slice(0, -3).concat('...') : symbol
}

export function displaySocialName(social: string) {
    if (social.startsWith('https://')) return 'Website'
    if (social.startsWith('@')) return 'Twitter'

    return 'Unknown'
}
