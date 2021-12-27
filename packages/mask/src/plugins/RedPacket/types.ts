import type { ERC20TokenRecord } from '../Wallet/database/types'
import type {
    EthereumTokenType,
    FungibleTokenDetailed,
    ChainId,
    ERC721TokenDetailed,
    ERC721TokenOutMask,
} from '@masknet/web3-shared-evm'

//#region erc20 red packet
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
    sender: {
        address: string
        name: string
        message: string
    }
    contract_version: number
    network?: string
    token_type?: EthereumTokenType.Native | EthereumTokenType.ERC20
    token?: FungibleTokenDetailed
    token_address?: string
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
//#endregion

//#region nft red packet
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
    sender: {
        address: string
        name: string
        message: string
    }
    contract_version: number
    network?: string
    token_type: EthereumTokenType.ERC721
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export enum NFTSelectOption {
    All = 'All',
    Partial = 'Partial',
}

interface ERC721TokenContract {
    address: string
    name: string
    symbol: string
    chain_id: number
}

export interface NftRedPacketSubgraphInMask extends Omit<RedPacketBasic, 'is_random'> {
    token: ERC721TokenDetailed
    token_contract: ERC721TokenContract
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

export interface NftRedPacketSubgraphOutMask extends Omit<NftRedPacketSubgraphInMask, 'token'> {
    token: ERC721TokenOutMask
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
//#endregion

export enum DialogTabs {
    create = 0,
    past = 1,
}

export enum RpTypeTabs {
    ERC20 = 0,
    ERC721 = 1,
}
