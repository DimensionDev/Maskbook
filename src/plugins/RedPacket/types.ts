import type { BigNumber } from 'bignumber.js'
import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, EthereumNetwork } from '../../web3/types'
export type RedPacketCreationResult =
    | {
          type: 'success'
          block_creation_time: Date
          red_packet_id: string
          total: BigNumber
          creator: string
      }
    | { type: 'failed'; reason?: string }
export type RedPacketClaimResult =
    | {
          type: 'success'
          red_packet_id: string
          /** receiver's address */
          claimer: string
          /** claimed money amount */
          claimed_value: BigNumber
      }
    | { type: 'failed'; reason?: string }

export interface CheckRedPacketAvailabilityResult {
    token_address: string
    balance: BigNumber
    totalCount: number
    claimedCount: number
    expired: boolean
    is_claimed: boolean
}

export interface CreateRedPacketResult {
    /** The transaction hash */
    create_transaction_hash: string
    create_nonce: number
}

/**
 * @see https://github.com/DimensionDev/Tessercube-iOS/wiki/Red-Packet-Data-Dictionary
 */

export interface RedPacketRecord {
    /** UUID PRIMARY KEY */
    id: string
    /** Start from 1 */
    aes_version: number
    /** Start from 1 */
    contract_version: number
    contract_address: string
    /** password that used to receive the red packet */
    password: string
    /**
     * true if 'Random Mode'. false if 'Average Mode'
     */
    is_random: boolean
    /** create transaction nonce when send */
    create_nonce?: number
    /** create transaction hash */
    create_transaction_hash?: string
    /** Read from create transaction result */
    block_creation_time?: Date
    /** Available time after block_creation_time. In seconds. Default 86400 (24hrs) */
    duration: number
    /** Read from create transaction result */
    red_packet_id?: string
    /** JSON payload. See raw_payload below */
    raw_payload?: RedPacketJSONPayload
    enc_payload?: string
    /** Red packet sender address */
    sender_address: string
    /** Trimmed not empty single line string. Max 30 chars */
    sender_name: string
    /** Red packet total value in Wei if ETH. In minimal unit if ERC20 token */
    send_total: BigNumber
    /** Trimmed single line string. Allow empty input. Max 140 chars. Replace inline break with space */
    send_message: string
    /** Last in-app share action time */
    last_share_time?: Date
    /** Address for the wallet to claim */
    claim_address?: string
    /** claim transaction hash */
    claim_transaction_hash?: string
    /** Read from claim result */
    claim_amount?: BigNumber
    refund_transaction_hash?: string
    refund_amount?: BigNumber
    /** Red packet status machine marker. See RedPacketStatus below */
    status: RedPacketStatus
    /** web3 network tag enum. Mainnet or Rinkeby */
    network: EthereumNetwork
    /** token type tag for red packet */
    token_type: EthereumTokenType
    /** ERC20Token contract address if erc20 token type */
    erc20_token?: string
    /** ERC20 approve transaction hash */
    erc20_approve_transaction_hash?: string
    /** ERC20 approve transaction event value */
    erc20_approve_value?: BigNumber
    /** incoming red packet time */
    received_time: Date
    /** Number of red packet shares */
    shares: BigNumber
    _found_in_url_?: string
}
export interface RedPacketRecordInDatabase
    extends Omit<RedPacketRecord, 'send_total' | 'claim_amount' | 'refund_amount' | 'erc20_approve_value' | 'shares'> {
    send_total: string | bigint
    claim_amount?: string | bigint
    refund_amount?: string | bigint
    erc20_approve_value?: string | bigint
    shares: string | bigint
    type: 'red-packet'
}
export enum RedPacketTokenType {
    eth = 0,
    erc20 = 1,
    erc721 = 2,
}
export enum RedPacketStatus {
    /** Red packet ready to send */
    initial = 'initial',
    /** After read create transaction hash */
    pending = 'pending',
    /** Fail to send. [END] */
    fail = 'fail',
    normal = 'normal',
    incoming = 'incoming',
    /** After read claim transaction hash */
    claim_pending = 'claim_pending',
    /** After read claim success result */
    claimed = 'claimed',
    expired = 'expired',
    /** [END] */
    empty = 'empty',
    refund_pending = 'refund_pending',
    /** [END] */
    refunded = 'refunded',
}

export interface RedPacketJSONPayload {
    contract_version: number
    contract_address: string
    rpid: string
    password: string
    shares: number
    sender: {
        address: string
        name: string
        message: string
    }
    is_random: boolean
    total: string
    creation_time: number
    duration: number
    network?: EthereumNetwork
    token_type: EthereumTokenType
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export namespace History {
    export type RecordType = CreateRedPacketRecord

    export interface CreateRedPacketRecord {
        method: 'create_red_packet'
        txHash: string
        txTimestamp: string
        txBlockNumber: string
        _hash: string
        _number: string
        _ifrandom: boolean
        _duration: string
        _seed: string
        _message: string
        _name: string
        _token_type: string
        _token_addr: string
        _total_tokens: string
    }
}
