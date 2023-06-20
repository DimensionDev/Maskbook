import type { FungibleToken } from '@masknet/web3-shared-base'
import type { SchemaType, ChainId } from '@masknet/web3-shared-evm'

// #region erc20 red packet
export interface RedPacketRecord {
    id: string
    /** From twitter/facebook url */
    from: string
    password: string
    contract_version: number
}

export interface RedPacketRecordInDatabase extends RedPacketRecord {
    /** An unique record type in DB */
    type: 'red-packet'
}

export enum RedPacketStatus {
    claimed = 'claimed',
    expired = 'expired',
    empty = 'empty',
    refunded = 'refunded',
}

interface RedPacketBasic {
    contract_address: string
    rpid: string
    txid: string
    password: string
    shares: number
    is_random: boolean
    total: string
    creation_time: number
    duration: number
    block_number?: number
}

export interface RedPacketJSONPayload extends RedPacketBasic {
    contract_version: number
    sender: {
        address: string
        name: string
        message: string
    }
    chainId?: ChainId
    network?: string
    token?: FungibleToken<ChainId, SchemaType>
    total_remaining?: string
}

export interface RedPacketJSONPayloadFromChain extends Omit<RedPacketJSONPayload, 'token'> {
    token_address: string
}

export interface RedpacketAvailability {
    token_address: string
    balance: string
    total: number
    claimed: number
    expired: boolean
    claimed_amount: string
}
// #endregion

// #region nft red packet
export interface RedPacketNftJSONPayload {
    id: string
    txid: string
    duration: number
    message: string
    senderName: string
    contractName: string
    contractAddress: string
    contractVersion: number
    contractTokenURI: string
    privateKey: string
    chainId: ChainId
}

export interface NftRedPacketJSONPayload extends Omit<RedPacketBasic, 'is_random' | 'total'> {
    contract_version: number
    sender: {
        address: string
        name: string
        message: string
    }
    chainId: ChainId
    network?: string
    token_ids: string[]
    token_address: string
    token?: Pick<FungibleToken<ChainId, SchemaType>, 'address' | 'name' | 'decimals' | 'symbol'>
}

export interface RedPacketNftRecord {
    id: string
    password: string
    contract_version: number
}

export interface RedPacketNftRecordInDatabase extends RedPacketNftRecord {
    /** An unique record type in DB */
    type: 'red-packet-nft'
}
// #endregion
