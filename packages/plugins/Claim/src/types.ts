import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { BigNumber } from 'bignumber.js'

export interface SwappedTokenType {
    pids: string[]
    amount: BigNumber
    token: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    isClaimable: boolean
    unlockTime: Date
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

export enum ActivityStatus {
    NOT_START = 'NOT_START',
    IN_PROGRESS = 'IN_PROGRESS',
    ENDED = 'ENDED',
}
