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
    /** UUID is the passwords that used to receive the red packet */
    uuids: string[]
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
    /** Available time after block_creation_time. In seconds */
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
    /** Red packet total value in Wei */
    send_total: bigint
    /** Trimmed single line string. Allow empty input. Max 140 chars. Replace inline break with space */
    send_message: string
    /** Last in-app share action time */
    last_share_time?: Date
    /** Address for the wallet to claim */
    claim_address?: string
    /** claim transaction hash */
    claim_transaction_hash?: string
    /** Read from claim result */
    claim_amount?: bigint
    refund_transaction_hash?: string
    refund_amount?: bigint
    /** Red packet status machine marker. See RedPacketStatus below */
    status: RedPacketStatus
    /** web3 network tag enum. Mainnet or Rinkeby */
    network: EthereumNetwork
    /** token type tag for red packet */
    token_type: RedPacketTokenType
    /** ERC20Token object if erc20 token type */
    erc20_token?: ERC20TokenRecord
    /** ERC20 approve transaction hash */
    erc20_approve_transaction_hash?: string
    /** ERC20 approve transaction event value */
    erc20_approve_value?: bigint
}
export interface WalletTokenRecord {
    /** UUID PRIMARY KEY */
    id: string
    /** Wallet id */
    wallet_id: string
    /** ERC20Token id */
    token_id: string
    /** token order index on wallet_id. From 0 to N */
    index: number
    /** Wallet token balance */
    token_balance?: bigint
}
export interface WalletRecord {
    /** UUID PRIMARY KEY */
    id: string
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** Wallet ethereum balance */
    eth_balance?: bigint
    mnemonic: string[]
    passphrase: string
}
export interface ERC20TokenRecord {
    /** same to address */
    id: string
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
export enum EthereumNetwork {
    Mainnet = 'Mainnet',
    Rinkeby = 'Rinkeby',
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
            return RedPacketStatus.expired === next
        default:
            const _x: never = current
            return false
    }
}
export interface RedPacketJSONPayload {
    contract_version: number
    contract_address: string
    rpid: string
    passwords: string[]
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
    token_type: RedPacketTokenType
    token?: ERC20TokenRecord
}
