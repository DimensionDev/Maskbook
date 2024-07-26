import MIRRORED_TOKENS from './mirrored_tokens.json'
import type { TrendingAPI } from '../entry-types.js'

export function isMirroredKeyword(symbol: string) {
    return MIRRORED_TOKENS.map((x) => x.symbol).some((x) => x.toUpperCase() === symbol.toUpperCase())
}

export function getCommunityLink(links: string[]): TrendingAPI.CommunityUrls {
    return links.map((x) => {
        if (x.includes('twitter') || x.includes('x.com')) return { type: 'twitter', link: x }
        if (x.includes('t.me')) return { type: 'telegram', link: x }
        if (x.includes('facebook')) return { type: 'facebook', link: x }
        if (x.includes('discord')) return { type: 'discord', link: x }
        if (x.includes('reddit')) return { type: 'reddit', link: x }
        return { type: 'other', link: x }
    })
}
