import type { BN, web3 } from '@coral-xyz/anchor'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export enum NFTSelectOption {
    All = 'All',
    Partial = 'Partial',
}

export enum RequirementType {
    Follow = 'Follow',
    Like = 'Like',
    Repost = 'Repost',
    Comment = 'Comment',
    NFTHolder = 'NFTHolder',
}

export type FireflyRedpacketSettings = {
    requirements: RequirementType[]
    nftHolderContract?: string
    nftCollectionName?: string
}

export type FireflySocialProfile = {
    profileId: string
    displayName: string
    handle: string
    fullHandle: string
    pfp: string
    address?: string
    ownedBy?: string
}

export interface FireflyContext {
    currentLensProfile?: FireflySocialProfile | null
    currentFarcasterProfile?: FireflySocialProfile | null
    currentTwitterProfile?: FireflySocialProfile | null
}

export enum FireflyAccountSource {
    Lens = 'Lens',
    Farcaster = 'Farcaster',
    Wallet = 'Wallet',
}

export enum RedPacketTabs {
    tokens = 'tokens',
    collectibles = 'collectibles',
}
export enum HistoryTabs {
    Sent = 'sent',
    Claimed = 'claimed',
}

// TODO Get rid of index which is from legacy code
export type OrderedERC721Token = NonFungibleToken<ChainId, SchemaType.ERC721> & {
    index: number
}

export interface RedPack {
    creator: string
    totalNumber: number
    claimedNumber: number
    totalAmount: number
    claimedAmount: number
    createTime: number
    duration: number
    tokenType: string
    tokenMint: string | null
    claimedUsers: string[]
    claimedAmountRecords: number[]
}

export interface RedPacketAccount {
    creator: web3.PublicKey // The creator of the red packet
    totalNumber: BN // Total number of red packets
    claimedNumber: BN // Number of red packets claimed
    totalAmount: BN // Total amount in the red packet
    claimedAmount: BN // Total amount claimed
    createTime: BN // Timestamp of red packet creation
    duration: BN // Duration of the red packet's validity
    tokenType: number // 0 = Native, 1 = SPL
    tokenMint: web3.PublicKey | null // Token mint address if SPL token
    claimedUsers: web3.PublicKey[] // List of users who claimed
    claimedAmountRecords: BN[] // List of claimed amounts
}

export interface HistoryInfo {
    rp_msg: string
    redpacket_id: string
    received_time?: string
    token_decimal: number
    total_amounts?: string
    token_symbol: string
    token_amounts?: string
    token_logo: string
    chain_id: number
    creator?: string
    claim_numbers?: string
    total_numbers?: string
    claim_amounts?: string
    create_time?: number
    redpacket_status?: FireflyRedPacketAPI.RedPacketStatus
    ens_name?: string
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[]
    share_from?: string
    theme_id?: string
    trans_hash: string
    duration: number
}
