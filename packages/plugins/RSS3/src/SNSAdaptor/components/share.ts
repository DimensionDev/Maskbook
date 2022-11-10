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
    ProfileLink = 18,
    TokenIn = 19,
    TokenLiquidity = 20,
    TokenOut = 21,
    TokenStake = 22,
    TokenSwap = 23,
    UnknownBurn = 24,
    UnknownCancel = 25,
    UnknownIn = 26,
    UnknownOut = 27,
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
    [CardType.ProfileLink]: Icons.ProfileLink,
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

export const platformIconMap: Record<RSS3BaseAPI.Network | RSS3BaseAPI.Platform, IconComponent | null> = {
    // Networks
    ethereum: Icons.ETH,
    binance_smart_chain: Icons.BSC,
    polygon: Icons.PolygonScan,
    xdai: Icons.Gnosis,
    arbitrum: Icons.Arbitrum,
    optimism: Icons.Optimism,
    fantom: Icons.Fantom,
    avalanche: Icons.Avalanche,
    // TODO icon for zksync is missing
    zksync: Icons.ZkScan,
    // Platforms
    Gitcoin: Icons.Gitcoin,
    Mirror: Icons.Mirror,
    Snapshot: Icons.Snapshot,
    Uniswap: Icons.Uniswap,
    binance: Icons.BSC,
    Lens: Icons.Lens,
    Farcaster: Icons.Farcaster,
    crossbell: Icons.Crossbell,
    '0x': Icons.ZeroX,
    'ENS Registrar': null,
    CrossSync: Icons.CrossSync,
    Crossbell: Icons.Crossbell,
    MetaMask: Icons.MetaMask,
    OpenSea: Icons.OpenSea,
    SushiSwap: Icons.SushiSwap,
    PancakeSwap: Icons.PancakeSwap,
    Aave: Icons.Aave,
    'crossbell.io': Icons.Crossbell,
    xLog: Icons.XLog,
    'EIP-1577': Icons.EIP1577,
    Planet: Icons.Planet,
    arweave: Icons.Arweave,
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
    return markdown.replace(/(<img [^>]*)\bsrc=("|')([^"']*)\2([^>]*>)/gi, (match, before, quotation, url, after) => {
        if (url.match(/^https?:\/\//)) return match
        return `${before}src=${quotation}https://thumbor.rss3.dev/unsafe/${base}/${url}${quotation}${after}`
    })
}
