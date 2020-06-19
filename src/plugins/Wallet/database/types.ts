import type { BigNumber } from 'bignumber.js'
import { unreachable } from '../../../utils/utils'

export enum EthereumNetwork {
    Mainnet = 'Mainnet',
    Rinkeby = 'Rinkeby',
    Ropsten = 'Ropsten',
}

export enum EthereumTokenType {
    ETH = 0,
    ERC20 = 1,
    ERC721 = 2,
}

//#region red packet

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
    _data_source_: 'real' | 'mock'
}
export interface RedPacketRecordInDatabase
    extends Omit<RedPacketRecord, 'send_total' | 'claim_amount' | 'refund_amount' | 'erc20_approve_value' | 'shares'> {
    send_total: string | bigint
    claim_amount?: string | bigint
    refund_amount?: string | bigint
    erc20_approve_value?: string | bigint
    shares: string | bigint
}
export interface WalletRecord {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    /** Wallet ethereum balance */
    eth_balance?: BigNumber
    erc20_token_balance: Map</** address of the erc20 token */ string, BigNumber | undefined>
    mnemonic: string[]
    passphrase: string
    createdAt: Date
    updatedAt: Date
    _data_source_: 'real' | 'mock'
    /** Wallet recover from private key */
    _private_key_?: string
    _wallet_is_default?: boolean
}
export interface WalletRecordInDatabase extends Omit<WalletRecord, 'eth_balance' | 'erc20_token_balance'> {
    eth_balance?: string | bigint
    erc20_token_balance: Map<string, string | bigint | undefined>
}
export interface ERC20TokenRecord {
    /** same to address */
    // id: string
    /** token address */
    address: string
    /** token name */
    name: string
    /** token decimal */
    decimals: number
    /** token symbol */
    symbol: string
    network: EthereumNetwork
    /** Yes if user added token */
    is_user_defined: boolean
    /** Delete time for soft delete */
    deleted_at?: Date
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
export function isNextRedPacketStatusValid(current: RedPacketStatus, next: RedPacketStatus) {
    switch (current) {
        case RedPacketStatus.initial:
            return [RedPacketStatus.pending, RedPacketStatus.fail].includes(next)
        case RedPacketStatus.pending:
            return [RedPacketStatus.fail, RedPacketStatus.normal].includes(next)
        case RedPacketStatus.fail:
        case RedPacketStatus.empty:
        case RedPacketStatus.refunded:
            return false
        case RedPacketStatus.normal:
        case RedPacketStatus.incoming:
            return [RedPacketStatus.claim_pending, RedPacketStatus.expired, RedPacketStatus.empty].includes(next)
        case RedPacketStatus.claim_pending:
            return [RedPacketStatus.normal, RedPacketStatus.incoming, RedPacketStatus.claimed].includes(next)
        case RedPacketStatus.claimed:
            return [RedPacketStatus.refund_pending, RedPacketStatus.expired].includes(next)
        case RedPacketStatus.expired:
            return RedPacketStatus.refund_pending === next
        case RedPacketStatus.refund_pending:
            return RedPacketStatus.refunded === next
        default:
            return unreachable(current)
    }
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
//#endregion

//#region wallet
export interface WalletRecord {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    /** Wallet ethereum balance */
    eth_balance?: BigNumber
    erc20_token_balance: Map</** address of the erc20 token */ string, BigNumber | undefined>
    mnemonic: string[]
    passphrase: string
    _data_source_: 'real' | 'mock'
    /** Wallet recover from private key */
    _private_key_?: string
    _wallet_is_default?: boolean
}
export interface WalletRecordInDatabase extends Omit<WalletRecord, 'eth_balance' | 'erc20_token_balance'> {
    eth_balance?: string | bigint
    erc20_token_balance: Map<string, string | bigint | undefined>
}
//#endregion

//#region erc20
export interface ERC20TokenRecord {
    /** same to address */
    // id: string
    /** token address */
    address: string
    /** token name */
    name: string
    /** token decimal */
    decimals: number
    /** token symbol */
    symbol: string
    network: EthereumNetwork
    /** Yes if user added token */
    is_user_defined: boolean
    /** Delete time for soft delete */
    deleted_at?: Date
}
//#endregion

//#region gitcoin
export interface GitcoinDonationPayload {
    donor_address: string
    donation_address: string
    donation_total: BigNumber
    network: EthereumNetwork
    token_type: EthereumTokenType
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export interface GitcoinDonationRecord {
    /** The address of donor's account */
    donor_address: string
    /** The donation transaction hash. */
    donation_transaction_hash: string
    /** The address of the project owner's account */
    donation_address: string
    /** The total donation value in Wei if ETH. In minimal unit if ERC20 token */
    donation_total: BigNumber
    /** The donation value which for project owner */
    donation_value: BigNumber
    /** web3 network tag enum. Mainnet or Rinkeby */
    network: EthereumNetwork
    /** token type tag for red packet */
    token_type: EthereumTokenType
    /** The tip transaction hash */
    tip_transaction_hash?: string
    /** The tip value for Gitcoin maintainer */
    tip_value?: BigNumber
    /** ERC20Token contract address if erc20 token */
    erc20_token?: string
    /** ERC20 approve transaction event value */
    erc20_approve_value?: BigNumber
    /** ERC20 approve transaction hash */
    erc20_approve_transaction_hash?: string
    _data_source_: 'real' | 'mock'
}

export interface GitcoinDonationRecordInDatabase
    extends Omit<GitcoinDonationRecord, 'donation_total' | 'donation_value' | 'tip_value' | 'erc20_approve_value'> {
    donation_total: string | bigint
    donation_value: string | bigint
    tip_value?: string | bigint
    erc20_approve_value?: string | bigint
}
//#endregion
