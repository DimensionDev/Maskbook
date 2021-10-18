import type { ChainId, TransactionStatusType } from '@masknet/web3-shared-evm'
import type { JsonRpcPayload } from 'web3-core-helpers'

export interface ERC20TokenRecord {
    /** contract address */
    address: string
    /** eth chain id */
    chainId: ChainId
    /** token name */
    name: string
    /** token decimal */
    decimals: number
    /** token symbol */
    symbol: string
}

export interface ERC1155TokenRecord {
    /** contract address */
    address: string
    /** eth chain id */
    chainId: ChainId
    /** token name */
    name: string
    /** token id */
    tokenId: string
    /** asset uri */
    uri?: string
    /** asset name */
    assetName?: string
    /** asset description */
    assetDescription?: string
    /** asset img uri */
    assetImage?: string
}

export interface WalletRecord {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    /** A list of trusted ERC20 contract address */
    erc20_token_whitelist: Set<string>
    /** A list of untrusted ERC20 contract address */
    erc20_token_blacklist: Set<string>
    /** A list of trusted ERC721 contract address */
    erc721_token_whitelist: Set<string>
    /** A list of untrusted ERC721 contract address */
    erc721_token_blacklist: Set<string>
    /** A list of trusted ERC1155 contract address */
    erc1155_token_whitelist: Set<string>
    /** A list of untrusted ERC1155 contract address */
    erc1155_token_blacklist: Set<string>
    /** The HD wallet path includes address index */
    path?: string
    mnemonic: string[]
    passphrase: string
    _public_key_?: string
    /** Wallet recover from private key */
    _private_key_?: string
    createdAt: Date
    updatedAt: Date
}

export interface PhraseRecord {
    id: string
    /** HD wallet path address index */
    index: number
    /** HD wallet path w/o address index */
    path: string
    mnemonic: string[]
    passphrase: string
    createdAt: Date
    updatedAt: Date
}

export interface TransactionRecord {
    /** A hash labels a transaction uniquely */
    hash: string
    /** Status type of transaction: SUCCEED, FAILED or NOT_DEPEND */
    status: TransactionStatusType
}

export interface TransactionChunkRecord {
    /** The transaction owner's address */
    address: string
    /** The chain id of network */
    chain_id: ChainId
    /** A chunk of recent transactions */
    transactions: TransactionRecord[]
    createdAt: Date
    updatedAt: Date
}

export interface UnconfirmedRequestChunkRecord {
    /** A chunk of unconfirmed rpc requests */
    requests: JsonRpcPayload[]
    createdAt: Date
    updatedAt: Date
}

export interface ERC20TokenRecordInDatabase extends ERC20TokenRecord {}

export interface ERC1155TokenRecordInDatabase extends ERC1155TokenRecord {
    record_id: string
}

export interface WalletRecordInDatabase extends WalletRecord {}

export interface PhraseRecordInDatabase extends PhraseRecord {}

export interface TransactionChunkRecordInDatabase extends TransactionChunkRecord {
    record_id: string
}

export interface UnconfirmedRequestChunkRecordInDatabase extends UnconfirmedRequestChunkRecord {
    record_id: string
}

export interface EncryptedWallet {
    type: 'wallet'
    id: 'wallet'
    encrypted: ArrayBuffer
    iv: ArrayBuffer
}
export interface EncryptedWalletPrimaryKey {
    type: 'primary-key'
    id: 'wallet'
    wrappedKey: ArrayBuffer
    iv: ArrayBuffer
}
