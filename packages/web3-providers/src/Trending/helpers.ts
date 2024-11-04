import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'
import { CURRENCIES_MAP } from './constants.js'
import MIRRORED_TOKENS from './mirrored_tokens.json' with { type: 'json' }
import type { TrendingAPI } from '../entry-types.js'

export function isMirroredKeyword(symbol: string) {
    return MIRRORED_TOKENS.map((x) => x.symbol).some((x) => x.toUpperCase() === symbol.toUpperCase())
}

export function getCommunityLink(links: string[]): TrendingAPI.CommunityUrls {
    return links.map((x) => {
        if (x.includes('twitter')) return { type: 'twitter', link: x }
        if (x.includes('t.me')) return { type: 'telegram', link: x }
        if (x.includes('facebook')) return { type: 'facebook', link: x }
        if (x.includes('discord')) return { type: 'discord', link: x }
        if (x.includes('reddit')) return { type: 'reddit', link: x }
        return { type: 'other', link: x }
    })
}

export function getCurrency(chainId: Web3Helper.ChainIdAll, dataProvider: SourceType | undefined) {
    if (!dataProvider) return undefined
    const currencies = CURRENCIES_MAP[dataProvider]
    if (!currencies) return
    return chainId && dataProvider === SourceType.NFTScan ?
            currencies.find((x) => x.chainId === chainId)
        :   CURRENCIES_MAP[dataProvider]?.[0]
}
