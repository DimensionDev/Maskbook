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
    // @deprecated
    is_mask?: boolean
    // @deprecated
    test_nums?: number[]
}

export interface PoolSubgraph {
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
