import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { ChainId as SolanaChainId, SchemaType as SolanaSchemaType } from '@masknet/web3-shared-solana'
import type { Cluster } from '@solana/web3.js'
import type { BigNumber } from 'bignumber.js'

// #region erc20 red packet
export interface RedPacketRecord {
    /** since 2.27.1 */
    chainId: number
    id: string
    /** From twitter/facebook url */
    from: string
    password?: string
    contract_version: number
    payload?: RedPacketJSONPayload
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
    /** RedPacket created via Firefly app omits the password field */
    password?: string
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
    token?: Web3Helper.FungibleTokenAll
    themeId?: string
    /**
     * For contract_version === 1, payload has no token but token_type
     */
    token_type?: 0 | number
    /** retrieve after decrypting the redpacket */
    total_remaining?: string

    // For solana
    tokenProgram?: string
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
    /** @since 2.32.0 */
    themeId: string
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

export type CreateRedpacketParam = {
    _duration: BigNumber
    _ifrandom: boolean
    _message: string
    _name: string
    _number: BigNumber
    _public_key: string
    _seed: string
    _token_addr: string
    _token_type: BigNumber
    _total_tokens: BigNumber
}

export type CreateNFTRedpacketParam = {
    _public_key: string
    _duration: BigNumber
    _seed: string
    _message: string
    _name: string
    _token_addr: string
    _erc721_token_ids: BigNumber[]
}

export interface SolanaRedPacketJSONPayload extends RedPacketBasic {
    rpid: string
    /**
     * @deprecated use rpid instead
     * redpacket account id
     */
    accountId: string
    contract_version: number
    sender: {
        address: string
        name: string
        message: string
    }
    chainId?: SolanaChainId
    /** cluster */
    network?: Cluster
    token?: FungibleToken<SolanaChainId, SolanaSchemaType>
    tokenProgram?: string
    themeId?: string
}
