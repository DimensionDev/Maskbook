import type { FungibleToken, NonFungibleToken, NonFungibleTokenContract } from '@masknet/web3-shared-base'
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

export interface RedPacketAvailability {
    token_address: string
    balance: string
    total: string
    claimed: string
    expired: boolean
    claimed_amount?: string // V2
    ifclaimed?: boolean // V1
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
    network?: string
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    claimers?: { address: string; name: string }[]
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

export interface NftRedPacketJSONPayload extends RedPacketBasic {
    contract_version: number
    sender: {
        address: string
        name: string
        message: string
    }
    network?: string
    token?: Pick<FungibleToken<ChainId, SchemaType>, 'address' | 'name' | 'decimals' | 'symbol'>
}

export enum NFTSelectOption {
    All = 'All',
    Partial = 'Partial',
}

export interface NftRedPacketSubgraphInMask extends Omit<RedPacketBasic, 'is_random'> {
    token: NonFungibleToken<ChainId, SchemaType>
    token_contract: NonFungibleTokenContract<ChainId, SchemaType>
    address: string
    chain_id: number
    message: string
    token_ids: string[]
    claimers: {
        name: string
        address: string
    }[]
    creator: {
        name: string
        address: string
    }
    total_remaining: string
}

export type NonFungibleTokenOutMask = Omit<NonFungibleToken<ChainId, SchemaType.ERC721>, 'chainId'> & {
    chain_id: ChainId
}

export interface NftRedPacketSubgraphOutMask extends Omit<NftRedPacketSubgraphInMask, 'token'> {
    token: NonFungibleTokenOutMask
}

export interface NftRedPacketHistory extends NftRedPacketSubgraphInMask {
    payload: NftRedPacketJSONPayload
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

export enum DialogTabs {
    create = 0,
    past = 1,
}

export enum RpTypeTabs {
    ERC20 = 0,
    ERC721 = 1,
}
