// cspell:disable
import { createElement, type ComponentType } from 'react'
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

const platformIconMap = {
    // Networks
    ethereum: Icons.ETH,
    'binance-smart-chain': Icons.BSC,
    polygon: Icons.Polygon,
    // xdai: Icons.Gnosis,
    arbitrum: Icons.Arbitrum,
    optimism: Icons.Optimism,
    avax: Icons.Avalanche,
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
} as const satisfies Record<Lowercase<RSS3BaseAPI.Network | RSS3BaseAPI.Platform>, IconComponent | null>

export function PlatformIcon({
    platform,
    width,
    height,
}: {
    platform: RSS3BaseAPI.Network | RSS3BaseAPI.Platform
    width: GeneratedIconNonSquareProps['width']
    height: GeneratedIconNonSquareProps['height']
}) {
    if (!platform) return null
    const Icon = platformIconMap[platform.toLowerCase() as Lowercase<RSS3BaseAPI.Network | RSS3BaseAPI.Platform>]
    if (!Icon) return null
    return createElement(Icon, { width, height })
}

const ONE_MIN = 60 * 1000
const ONE_HOUR = 60 * ONE_MIN
const ONE_DAY = 24 * ONE_HOUR
export const ONE_WEEK = 7 * ONE_DAY

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
        return new Intl.NumberFormat(undefined, { style: 'unit', unit: 'day', unitDisplay: 'short' }).format(days)
    }
    if (distance > ONE_HOUR) {
        const hours = Math.floor(distance / ONE_HOUR)
        return new Intl.NumberFormat(undefined, { style: 'unit', unit: 'hour', unitDisplay: 'short' }).format(hours)
    }
    const mins = Math.floor(distance / ONE_MIN)
    return new Intl.NumberFormat(undefined, { style: 'unit', unit: 'minute', unitDisplay: 'short' }).format(mins)
}
