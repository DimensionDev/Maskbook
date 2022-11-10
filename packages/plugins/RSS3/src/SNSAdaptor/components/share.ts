import { Icons } from '@masknet/icons'
import formatDateTime from 'date-fns/format'
import type { GeneratedIconNonSquareProps } from '@masknet/icons'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { ComponentType } from 'react'

export type IconComponent =
    | ComponentType<GeneratedIconNonSquareProps<never>>
    | ComponentType<GeneratedIconNonSquareProps<'light'>>
    | ComponentType<GeneratedIconNonSquareProps<'dark'>>
    | ComponentType<GeneratedIconNonSquareProps<'dim'>>

export enum CardType {
    AchievementBurn = 1,
    AchievementReceive = 2,
    CollectibleBurn = 3,
    CollectibleIn = 4,
    CollectibleMint = 5,
    CollectibleOut = 6,
    DonationDonate = 7,
    DonationLaunch = 8,
    GovernancePropose = 9,
    GovernanceVote = 10,
    NoteCreate = 11,
    NoteMint = 12,
    NoteEdit = 13,
    NoteLink = 14,
    NoteBurn = 15,
    ProfileBurn = 16,
    ProfileCreate = 17,
    ProfileUpdate = 18,
    ProfileLink = 19,
    TokenMint = 20,
    TokenIn = 21,
    TokenLiquidity = 22,
    TokenOut = 23,
    TokenStake = 24,
    TokenSwap = 25,
    UnknownBurn = 26,
    UnknownCancel = 27,
    UnknownIn = 28,
    UnknownOut = 29,
}

export const cardTypeIconMap: Record<CardType, IconComponent> = {
    [CardType.AchievementBurn]: Icons.AchievementBurn,
    [CardType.AchievementReceive]: Icons.AchievementReceive,
    [CardType.CollectibleBurn]: Icons.CollectibleBurn,
    [CardType.CollectibleIn]: Icons.CollectibleIn,
    [CardType.CollectibleMint]: Icons.CollectibleMint,
    [CardType.CollectibleOut]: Icons.CollectibleOut,
    [CardType.DonationDonate]: Icons.DonationDonate,
    [CardType.DonationLaunch]: Icons.DonationLaunch,
    [CardType.GovernancePropose]: Icons.GovernancePropose,
    [CardType.GovernanceVote]: Icons.GovernanceVote,
    [CardType.NoteCreate]: Icons.NoteCreate,
    [CardType.NoteMint]: Icons.NoteMint,
    [CardType.NoteEdit]: Icons.NoteEdit,
    [CardType.NoteLink]: Icons.NoteLink,
    [CardType.NoteBurn]: Icons.NoteBurn,
    [CardType.ProfileBurn]: Icons.ProfileBurn,
    [CardType.ProfileCreate]: Icons.ProfileCreate,
    [CardType.ProfileUpdate]: Icons.ProfileUpdate,
    [CardType.ProfileLink]: Icons.ProfileLink,
    [CardType.TokenMint]: Icons.TokenMint,
    [CardType.TokenIn]: Icons.TokenIn,
    [CardType.TokenLiquidity]: Icons.TokenLiquidity,
    [CardType.TokenOut]: Icons.TokenOut,
    [CardType.TokenStake]: Icons.TokenStake,
    [CardType.TokenSwap]: Icons.TokenSwap,
    [CardType.UnknownBurn]: Icons.UnknownBurn,
    [CardType.UnknownCancel]: Icons.UnknownCancel,
    [CardType.UnknownIn]: Icons.UnknownIn,
    [CardType.UnknownOut]: Icons.UnknownOut,
}

const platformIconMap: Record<Lowercase<RSS3BaseAPI.Network | RSS3BaseAPI.Platform>, IconComponent | null> = {
    // Networks
    ethereum: Icons.ETH,
    binance_smart_chain: Icons.BSC,
    polygon: Icons.PolygonScan,
    xdai: Icons.Gnosis,
    arbitrum: Icons.Arbitrum,
    optimism: Icons.Optimism,
    fantom: Icons.Fantom,
    avalanche: Icons.Avalanche,
    zksync: Icons.ZkScan,
    // Platforms
    gitcoin: Icons.Gitcoin,
    mirror: Icons.Mirror,
    snapshot: Icons.Snapshot,
    uniswap: Icons.Uniswap,
    binance: Icons.BSC,
    lens: Icons.Lens,
    farcaster: Icons.Farcaster,
    crossbell: Icons.Crossbell,
    '0x': Icons.ZeroX,
    'ens registrar': null,
    crosssync: Icons.CrossSync,
    metamask: Icons.MetaMask,
    opensea: Icons.OpenSea,
    sushiswap: Icons.SushiSwap,
    pancakeswap: Icons.PancakeSwap,
    aave: Icons.Aave,
    'crossbell.io': Icons.Crossbell,
    xlog: Icons.XLog,
    'eip-1577': Icons.EIP1577,
    planet: Icons.Planet,
    arweave: Icons.Arweave,
}

export const getPlatformIcon = (platform?: RSS3BaseAPI.Network | RSS3BaseAPI.Platform) => {
    if (!platform) return null
    return platformIconMap[platform.toLowerCase() as Lowercase<RSS3BaseAPI.Network | RSS3BaseAPI.Platform>]
}

export const hostIconMap: Record<string, IconComponent> = {
    'etherscan.io': Icons.EtherScan,
    'opensea.io': Icons.OpenSea,
    'polygonscan.com': Icons.PolygonScan,
    'crossbell.io': Icons.Crossbell,
    'scan.crossbell.io': Icons.Crossbell,
    'lenster.xyz': Icons.Lens,
    'looksrare.org': Icons.LooksRare,
    'gitcoin.co': Icons.Gitcoin,
    'bscscan.com': Icons.BSC,
    'zkscan.io': Icons.ZkScan,
    'mirror.xyz': Icons.Mirror,
    'ipfs.io': Icons.IPFS,
    'snapshot.org': Icons.Snapshot,
}

export const hostNameMap: Record<string, string> = {
    'etherscan.io': 'Etherscan',
    'opensea.io': 'Opensea',
    'polygonscan.com': 'Polygonscan',
    'crossbell.io': 'Crossbell',
    'scan.crossbell.io': 'Crossbell Scan',
    'lenster.xyz': 'Lenster',
    'looksrare.org': 'LooksRare',
    'gitcoin.co': 'Gitcoin',
    'bscscan.com': 'BscScan',
    'zkscan.io': 'ZkScan',
    'ipfs.io': 'IPFS',
    'snapshot.org': 'Snapshot',
    'mirror.xyz': 'Mirror',
}

export function getLastAction<
    T extends RSS3BaseAPI.Tag,
    P extends keyof RSS3BaseAPI.MetadataMap[T] = keyof RSS3BaseAPI.MetadataMap[T],
>(feed: RSS3BaseAPI.Web3FeedGeneric<T, P>) {
    return feed.actions[feed.actions.length - 1]
}

const ONE_MIN = 60 * 1000
const ONE_HOUR = 60 * ONE_MIN
const ONE_DAY = 24 * ONE_HOUR
const ONE_WEEK = 7 * ONE_DAY

const plural = (num: number, unit: string) => `${num} ${unit}${num !== 1 ? 's' : ''}`

/**
 * A datetime formatter follows RSS3's
 */
export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    const ms = date.getTime()
    const distance = Date.now() - ms
    if (distance > ONE_WEEK) {
        return formatDateTime(date, 'MM/dd/yyyy')
    }
    if (distance > ONE_DAY) {
        const days = Math.floor(distance / ONE_DAY)
        return plural(days, 'day')
    }
    if (distance > ONE_HOUR) {
        const hours = Math.floor(distance / ONE_HOUR)
        return plural(hours, 'hr')
    }
    const mins = Math.floor(distance / ONE_MIN)
    return plural(mins, 'min')
}

export function transformPlanetResource(markdown: string, base: string) {
    return markdown
        .replace(/(<img [^>]*)\bsrc=("|')([^"']*)\2([^>]*>)/gi, (match, before, quotation, url, after) => {
            if (url.match(/^https?:\/\//)) return match
            return `${before}src=${quotation}https://thumbor.rss3.dev/unsafe/${base}/${url}${quotation}${after}`
        })
        .replace(/(!\[.*?])\((.*?)\)/g, (match, head, url) => {
            if (url.match(/^https?:\/\//)) return match
            return `${head}(https://thumbor.rss3.dev/unsafe/${base}/${url})`
        })
}
