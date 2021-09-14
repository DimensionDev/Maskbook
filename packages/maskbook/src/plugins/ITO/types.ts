import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared'

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
    buyers: {
        address: string
        name: string
    }[]
    chain_id: ChainId
    start_time: number
    end_time: number
    unlock_time?: number
    qualification_address: string
    creation_time: number
    token: FungibleTokenDetailed
    exchange_amounts: string[]
    exchange_tokens: FungibleTokenDetailed[]
    regions: string
    block_number?: number
}

export interface JSON_PayloadFromChain extends Omit<JSON_PayloadInMask, 'exchange_tokens' | 'token'> {
    exchange_token_addresses: string[]
    token_address: string
}

export interface PoolFromSubgraph {
    pool: JSON_PayloadInMask
    exchange_in_volumes: string[]
    exchange_out_volumes: string[]
}

export interface ClaimablePool {
    pid: string
    token: FungibleTokenDetailed
}

//#region TokenOutMask
export type TokenOutMask = Omit<FungibleTokenDetailed, 'chainId'> & {
    chain_id: ChainId
}
//#endregion

export interface JSON_PayloadOutMask extends Omit<JSON_PayloadInMask, 'token' | 'exchange_tokens'> {
    token: TokenOutMask
    exchange_tokens: TokenOutMask[]
}

export interface JSON_PayloadComposeMask extends Omit<JSON_PayloadInMask, 'token' | 'exchange_tokens'> {
    token: string
    exchange_tokens: { address: string }[]
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
    unlocked: boolean
    unlock_time: string
    swapped: string
    exchanged_tokens: string[]
    claimed?: boolean
    start_time?: string
    end_time?: string
    qualification_addr?: string
}

//#region SpaceStation
export interface ClaimableCount {
    maxCount: number
    usedCount: number
}

export interface CampaignInfo {
    name: string
    description: string
    chain: string
    endTime: number
    startTime: number
    nfts: { image: string }[]
}

export interface ClaimParams {
    allow: boolean
    signature: string
    verifyIDs: number[]
    powahs: number[]
    nftCoreAddress: string
}
//#endregion
