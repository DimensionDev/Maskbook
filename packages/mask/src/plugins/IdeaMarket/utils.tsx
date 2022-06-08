import { ideaMarketPathnameRegexMatcher } from './constants'

export function checkUrl(url: string): boolean {
    return url.includes('ideamarket.io')
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

export function formatWithOperator(value: string | number): string {
    const valueToPercent = Number(value) * 100
    const operator = valueToPercent > 0 ? '+' : ''
    return `${operator}${valueToPercent.toFixed()}%`
}

export function truncate(text: string, max: number) {
    return text.length > max ? text.slice(0, max).concat('...') : text
}
