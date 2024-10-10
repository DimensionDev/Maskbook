// cspell:disable
import type { ComponentType } from 'react'
import { format as formatDateTime } from 'date-fns'
import { Icons } from '@masknet/icons'
import type { GeneratedIconNonSquareProps } from '@masknet/icons'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

type IconComponent =
    | ComponentType<GeneratedIconNonSquareProps>
    | ComponentType<GeneratedIconNonSquareProps<'light'>>
    | ComponentType<GeneratedIconNonSquareProps<'dark'>>
    | ComponentType<GeneratedIconNonSquareProps<'dim'>>
    | ComponentType<GeneratedIconNonSquareProps<'light' | 'dark'>>

export enum CardType {
    AchievementBurn = 1,
    AchievementReceive = 2,
    CollectibleBurn = 3,
    CollectibleIn = 4,
    CollectibleMint = 5,
    CollectibleOut = 6,
    CollectibleApproval = 7,
    DonationDonate = 8,
    DonationLaunch = 9,
    GovernancePropose = 10,
    GovernanceVote = 11,
    NoteCreate = 12,
    NoteMint = 13,
    NoteEdit = 14,
    NoteLink = 15,
    NoteBurn = 16,
    ProfileBurn = 17,
    ProfileCreate = 18,
    ProfileUpdate = 19,
    ProfileLink = 20,
    ProfileProxy = 21,
    TokenMint = 22,
    TokenIn = 23,
    TokenLiquidity = 24,
    TokenOut = 25,
    TokenStake = 26,
    TokenUnstake = 27,
    TokenSwap = 28,
    TokenBridge = 29,
    TokenBurn = 30,
    TokenApproval = 31,
    UnknownBurn = 32,
    UnknownCancel = 33,
    UnknownIn = 34,
    UnknownOut = 35,
}

export const cardTypeIconMap: Record<CardType, IconComponent> = {
    [CardType.AchievementBurn]: Icons.AchievementBurn,
    [CardType.AchievementReceive]: Icons.AchievementReceive,
    [CardType.CollectibleBurn]: Icons.CollectibleBurn,
    [CardType.CollectibleIn]: Icons.CollectibleIn,
    [CardType.CollectibleMint]: Icons.CollectibleMint,
    [CardType.CollectibleOut]: Icons.CollectibleOut,
    [CardType.CollectibleApproval]: Icons.CollectibleApprove,
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
    [CardType.ProfileProxy]: Icons.ProfileProxy,
    [CardType.TokenMint]: Icons.TokenMint,
    [CardType.TokenIn]: Icons.TokenIn,
    [CardType.TokenLiquidity]: Icons.TokenLiquidity,
    [CardType.TokenOut]: Icons.TokenOut,
    [CardType.TokenStake]: Icons.TokenStake,
    [CardType.TokenUnstake]: Icons.TokenUnstake,
    [CardType.TokenSwap]: Icons.TokenSwap,
    [CardType.TokenBridge]: Icons.TokenBridge,
    [CardType.TokenBurn]: Icons.TokenBurn,
    [CardType.TokenApproval]: Icons.ApprovalApprove,
    [CardType.UnknownBurn]: Icons.UnknownBurn,
    [CardType.UnknownCancel]: Icons.UnknownCancel,
    [CardType.UnknownIn]: Icons.UnknownIn,
    [CardType.UnknownOut]: Icons.UnknownOut,
}

const platformIconMap: Record<Lowercase<RSS3BaseAPI.Network | RSS3BaseAPI.Platform>, IconComponent | null> = {
    // Networks
    ethereum: Icons.ETH,
    'binance-smart-chain': Icons.BSC,
    polygon: Icons.Polygon,
    // xdai: Icons.Gnosis,
    arbitrum: Icons.Arbitrum,
    optimism: Icons.Optimism,
    avax: Icons.Avalanche,
    mirror: Icons.Mirror,
    uniswap: Icons.Uniswap,
    farcaster: Icons.Farcaster,
    crossbell: Icons.Crossbell,
    opensea: Icons.OpenSea,
    aave: Icons.Aave,
    arweave: Icons.Arweave,
    paragraph: Icons.Mirror,
    highlight: Icons.Highlight,
    iqwiki: Icons.Iqwiki,
    kiwistand: null,
    lens: Icons.DarkLens,
    lido: Icons.Lido,
    looksrare: Icons.LooksRare,
    matters: null,
    base: Icons.Base,
    gnosis: Icons.Gnosis,
    linea: Icons.Linea,
    '1inch': Icons.OneInch,
    aavegotchi: Icons.Aave,
    vsl: Icons.RSS3,
    rss3: Icons.RSS3,
    ens: Icons.ENS,
    curve: Icons.Curve,
    savm: Icons.Savm,
    stargate: Icons.Planet,
    planet: Icons.Planet,
    'ens registrar': Icons.ENS,
    unknown: null,
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
    'momoka.lens.xyz': Icons.Momoka,
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
    'momoka.lens.xyz': 'Momoka',
}

export function getLastAction<
    T extends RSS3BaseAPI.Tag,
    P extends keyof RSS3BaseAPI.MetadataMap[T] = keyof RSS3BaseAPI.MetadataMap[T],
>(feed: RSS3BaseAPI.Web3FeedGeneric<T, P>) {
    return feed.actions.at(-1)!
}

/**
 * Get cost from multiple actions.
 * We used to get it from the last action, but it might not always exists in
 * the last action.
 */
export function getCost(feed: RSS3BaseAPI.CollectibleTradeFeed): RSS3BaseAPI.TransactionMetadata | null {
    for (const action of feed.actions) {
        if (action.metadata?.cost) {
            return action.metadata.cost
        }
    }
    return null
}

const ONE_MIN = 60 * 1000
const ONE_HOUR = 60 * ONE_MIN
const ONE_DAY = 24 * ONE_HOUR
export const ONE_WEEK = 7 * ONE_DAY

const plural = (num: number, unit: string) => `${num} ${unit}${num !== 1 ? 's' : ''}`

/**
 * A datetime formatter follows RSS3's
 */
export function formatTimestamp(timestamp: number): string {
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
