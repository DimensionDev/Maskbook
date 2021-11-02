import type { ERC20TokenRecord } from '../Wallet/database/types'
import type {
    EthereumTokenType,
    NativeTokenDetailed,
    ERC20TokenDetailed,
    ChainId,
    ERC721TokenDetailed,
} from '@masknet/web3-shared-evm'

/**
 * @see https://github.com/DimensionDev/Tessercube-iOS/wiki/Red-Packet-Data-Dictionary
 */

//#region erc20 red packet
export interface RedPacketRecord {
    /** The red packet ID */
    id: string
    /** From twitter/facebook url */
    from: string
    password: string
    contract_version: number
    /** backward compatible V1 */
    payload?: {
        contract_version: number
        password: string
    }
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
    password: string
    shares: number
    is_random: boolean
    total: string
    creation_time: number
    duration: number
    message: string
}

export interface RedPacketJSONPayload extends RedPacketBasic {
    sender: {
        address: string
        name: string
        message: string
    }
    txid?: string
    contract_version: number
    network?: string
    token_type: EthereumTokenType.Native | EthereumTokenType.ERC20
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export interface NftRedPacketJSONPayload extends RedPacketBasic {
    sender: {
        address: string
        name: string
        message: string
    }
    txid?: string
    contract_version: number
    network?: string
    token_type: EthereumTokenType.ERC721
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export interface RedPacketRecordWithHistory {
    history: RedPacketHistoryInMask
    record: RedPacketRecord
}

//#region TokenOutMask
export type TokenOutMask = Omit<NativeTokenDetailed | ERC20TokenDetailed, 'chainId'> & {
    chain_id: ChainId
}
export type NftTokenOutMask = Omit<ERC721TokenDetailed, 'chainId'> & {
    chain_id: ChainId
}
//#endregion

export interface RedPacketHistoryInMask {
    rpid: string
    contract_address: string
    password: string
    shares: number
}
interface RedPacketCreator {
    name: string
    is_random: boolean
    total: string
    total_remaining: string
    creation_time: number
    last_updated_time: number
    duration: number
    chain_id: number
    token: NativeTokenDetailed | ERC20TokenDetailed
    creator: {
        name: string
        address: string
    }
    claimers: {
        name: string
        address: string
    }[]
    address: string
}

interface NFTRedPacketCreator extends Omit<RedPacketCreator, 'token' | 'is_random'> {
    token: ERC721TokenDetailed
}

export interface RedPacketSubgraphInMask extends RedPacketBasic {
    message: string
    name: string
    txid: string
    total_remaining: string
    last_updated_time: number
    chain_id: number
    token: NativeTokenDetailed | ERC20TokenDetailed
    creator: RedPacketCreator
    claimers: {
        name: string
        address: string
    }[]
}

interface ERC721TokenContract {
    address: string
    name: string
    symbol: string
    chain_id: number
}

export interface NftRedPacketSubgraphInMask extends Omit<RedPacketSubgraphInMask, 'is_random' | 'token' | 'creator'> {
    token: ERC721TokenDetailed
    token_contract: ERC721TokenContract
    creator: NFTRedPacketCreator
    address: string
    token_ids: string[]
    claimers: {
        name: string
        address: string
    }[]
}

export interface RedPacketSubgraphOutMask extends Omit<RedPacketSubgraphInMask, 'token'> {
    token: TokenOutMask
}

export interface NftRedPacketSubgraphOutMask extends Omit<NftRedPacketSubgraphInMask, 'token'> {
    token: NftTokenOutMask
}

export interface RedPacketHistory extends RedPacketSubgraphInMask {
    payload: RedPacketJSONPayload
    contract_version: number
}
export interface NftRedPacketHistory extends NftRedPacketSubgraphInMask {
    payload: NftRedPacketJSONPayload
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
