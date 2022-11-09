import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { BigNumber } from 'bignumber.js'

export interface JSON_PayloadInMask {
    contract_address: string
    pid: string // pool id
    password: string
    message: string
    limit: string
    total: string
    total_remaining: string
    seller: {
        address: string
        name?: string
    }
    chain_id: ChainId
    start_time: number
    end_time: number
    unlock_time?: number
    qualification_address: string
    creation_time: number
    token: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    exchange_amounts: string[]
    exchange_tokens: Array<FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>>
    regions: string
    block_number?: number
}

export interface JSON_PayloadFromChain extends Omit<JSON_PayloadInMask, 'exchange_tokens' | 'token'> {
    exchange_token_addresses: string[]
    token_address: string
}

export interface PoolFromNetwork {
    pool: JSON_PayloadInMask | JSON_PayloadFromChain
    exchange_in_volumes: string[]
    exchange_out_volumes: string[]
}

export interface ClaimablePool {
    pid: string
    token: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
}

export interface SwappedTokenType {
    pids: string[]
    amount: BigNumber
    token: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    isClaimable: boolean
    unlockTime: Date
}

export type FungibleTokenOutMask = Omit<FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>, 'chainId'> & {
    chain_id: ChainId
}

export interface JSON_PayloadOutMask extends Omit<JSON_PayloadInMask, 'token' | 'exchange_tokens'> {
    token: FungibleTokenOutMask
    exchange_tokens: FungibleTokenOutMask[]
}

export interface JSON_PayloadComposeMask extends Omit<JSON_PayloadInMask, 'token' | 'exchange_tokens'> {
    token: string
    exchange_tokens: Array<{ address: string }>
}

export enum ITO_Status {
    waited = 'waited',
    started = 'started',
    expired = 'expired',
}

export interface PoolRecord {
    /** The pool ID */
    id: string
    /** From url */
    from: string
    /** The JSON payload */
    payload: JSON_PayloadInMask
}

export interface PoolRecordInDatabase extends PoolRecord {
    /** An unique record type in DB */
    type: 'ito-pool'
}

export enum DialogTabs {
    create = 0,
    past = 1,
}

export interface Availability {
    exchange_addrs: string[]
    remaining: number
    started: boolean
    expired: boolean
    destructed: boolean
    unlock_time: string
    swapped: string
    exchanged_tokens: string[]
    claimed?: boolean
    start_time?: string
    end_time?: string
    qualification_addr?: string
}

// #region SpaceStation
export interface ClaimableCount {
    maxCount: number
    usedCount: number
}

export interface CampaignInfo {
    id: number
    name: string
    description: string
    chain: string
    endTime: number
    startTime: number
    nfts: Array<{ image: string }>
}

export interface ClaimParams {
    allow: boolean
    signature: string
    verifyIDs: number[]
    powahs: number[]
    nftCoreAddress: string
}
// #endregion
