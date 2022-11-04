import { Icons } from '@masknet/icons'
import formatDateTime from 'date-fns/format'
import type { GeneratedIconNonSquareProps } from '@masknet/icons'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { ComponentType } from 'react'

export type IconComponent = ComponentType<GeneratedIconNonSquareProps<never>>

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
    NoteEdit = 12,
    NoteLink = 13,
    NoteBurn = 14,
    ProfileBurn = 15,
    ProfileCreate = 16,
    ProfileLink = 17,
    TokenIn = 18,
    TokenLiquidity = 19,
    TokenOut = 20,
    TokenStake = 21,
    TokenSwap = 22,
    UnknownBurn = 23,
    UnknownCancel = 24,
    UnknownIn = 25,
    UnknownOut = 26,
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
    binance_smart_chain: Icons.ETH,
    polygon: Icons.PolygonScan,
    xdai: Icons.Gnosis,
    arbitrum: Icons.Arbitrum,
    optimism: Icons.Optimism,
    fantom: Icons.Fantom,
    avalanche: Icons.Avalanche,
    zksync: Icons.ETH,
    // Platforms
    Gitcoin: Icons.Gitcoin,
    Mirror: Icons.Mirror,
    Snapshot: Icons.Snapshot,
    Uniswap: Icons.Uniswap,
    binance: Icons.BSC,
    Lens: Icons.Mirror,
    Farcaster: Icons.Farcaster,
    crossbell: Icons.Mirror,
    '0x': Icons.ZeroX,
    'ENS Registrar': null,
    CrossSync: Icons.Lens,
    Crossbell: Icons.Crossbell,
    MetaMask: Icons.MetaMask,
    OpenSea: Icons.OpenSea,
    SushiSwap: null,
    'crossbell.io': Icons.Crossbell,
    xLog: Icons.XLog,
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
}

export function getLastAction<T extends RSS3BaseAPI.Tag, P extends RSS3BaseAPI.TypeMap[T]>(
    feed: RSS3BaseAPI.Web3FeedGeneric<T, P>,
) {
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
        return plural(hours, 'hour')
    }
    const mins = Math.floor(distance / ONE_MIN)
    return plural(mins, 'min')
}
