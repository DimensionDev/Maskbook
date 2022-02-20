import { BASE_URL, ideaMarketPathnameRegexMatcher } from './constants'
import { TwitterIcon } from './icons/TwitterIcon'
import { MarketAvailable } from './types'
import LanguageIcon from '@mui/icons-material/Language'

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

export function getMarketFromLink(name: string) {
    if (name.startsWith('https://')) return 'url'
    if (name.startsWith('@')) return 'Twitter'

    return
}

export function urlWithoutProtocol(url: string) {
    return (url = url.replace(/^(http|https)?:\/\//, ''))
}

export function composeIdeaURL(marketName: string, ideaName: string) {
    if (marketName === MarketAvailable.Url)
        return `${BASE_URL}/i/${marketName.toLowerCase()}/${urlWithoutProtocol(ideaName)}`
    if (marketName === MarketAvailable.Twitter)
        return `${BASE_URL}/i/${marketName.toLowerCase()}/${ideaName.substring(1)}`

    return `${BASE_URL}/i/${marketName.toLowerCase()}/${ideaName}`
}

export function selectIconFromMarket(market: string) {
    switch (market) {
        case MarketAvailable.Twitter:
            return <TwitterIcon />

        case MarketAvailable.Url:
            return <LanguageIcon />

        default:
            return <LanguageIcon />
    }
}
