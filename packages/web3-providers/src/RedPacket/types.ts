import type { FungibleToken } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { ChainId as SolanaChainId, SchemaType as SolanaSchemaType } from '@masknet/web3-shared-solana'
import type { Cluster } from '@solana/web3.js'

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
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    token_type?: 0 | number
    /** retrieve after decrypting the redpacket */
    total_remaining?: string

    // For solana
    tokenProgram?: string
}

// #endregion

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
