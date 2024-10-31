// Parameter Types
interface TransactionQueryParams {
    /** Denominated currency value of returned prices. Default: "usd" */
    currency?:
        | 'eth'
        | 'btc'
        | 'usd'
        | 'eur'
        | 'krw'
        | 'rub'
        | 'gbp'
        | 'aud'
        | 'cad'
        | 'inr'
        | 'jpy'
        | 'nzd'
        | 'try'
        | 'zar'
        | 'cny'
        | 'chf'
    /** Query for a full-text search (2-64 chars) */
    'filter[search_query]'?: string
    /** Return only transactions with specified types */
    'filter[operation_types]'?: TransactionType[]
    /** Return only transactions that contain specified asset types */
    'filter[asset_types]'?: Array<'fungible' | 'nft'>
    /** Return only transactions from specified chains. You can find available chain ids in chain endpoints */
    'filter[chain_ids]'?: string[]
    /** Return only transactions with fungibles with specified ids */
    'filter[fungible_ids]'?: string[]
    /** Return only transactions since specific date. Timestamp in milliseconds */
    'filter[min_mined_at]'?: string
    /** Return only transactions until specific date. Timestamp in milliseconds */
    'filter[max_mined_at]'?: string
    /** Filter transactions based on the `is_trash` flag. If no flag is specified, then `no_filter` is applied */
    'filter[trash]'?: 'only_trash' | 'only_non_trash' | 'no_filter'
    /** This field is used for result pagination. You SHOULD NOT use this parameter directly */
    'page[after]'?: string
    /** Set maximum number of items per a page in the pagination (1-100). Default: 100 */
    'page[size]'?: number
}

/** Type of concrete transaction */
type TransactionType =
    | 'approve'
    | 'burn'
    | 'deploy'
    | 'deposit'
    | 'execute'
    | 'mint'
    | 'receive'
    | 'send'
    | 'trade'
    | 'withdraw'

// Response Types
export interface TransactionsResponse {
    links: {
        /** URL for the current response */
        self: string
        /** URL for the next page of results */
        next?: string
    }
    data: Transaction[]
}

export interface Transaction {
    /** Transaction resource type */
    type: 'transactions'
    /** Unique ID of the transaction */
    id: string
    attributes: TransactionAttributes
    relationships?: {
        /** The blockchain on which the transaction exists */
        chain: ChainRelationship
        /** The dapp associated with the transaction */
        dapp?: DappRelationship
    }
}

interface TransactionAttributes {
    /** Type of the transaction */
    operation_type?: TransactionType
    /** Hash of the transaction */
    hash: string
    /** Number of a block where the transaction was mined */
    mined_at_block: number
    /** Timestamp string in ISO 8601 format when the transaction was mined */
    mined_at: string
    /** Address of a sender of the transaction. It could be a smart contract address too */
    sent_from: string
    /** Address of a recipient of the transaction. It could a be smart contract address too */
    sent_to: string
    /** Status of the transaction */
    status: 'confirmed' | 'failed' | 'pending'
    /** Nonce of the transaction */
    nonce: number
    /** The fee that was paid for the transaction */
    fee: TransactionFee
    /** List of transfers. An empty list is returned if the transaction does not have any transfers */
    transfers: Transfer[]
    /** List of approvals. An empty list is returned if the transaction does not have any approvals */
    approvals: Approval[]
    /** Application metadata associated with the transaction */
    application_metadata?: DAppInfo
    flags?: {
        /** Is the transaction classified by Zerion as trash */
        is_trash?: boolean
    }
}

interface TransactionFee {
    fungible_info?: FungibleInfo
    /** The quantity details of the fee */
    quantity: Quantity
    /** Price of the asset when the transaction was mined */
    price: number
    /** The fee value in requested currency */
    value: number
}

interface Transfer {
    fungible_info?: FungibleInfo
    nft_info?: NFTInfo
    /** Direction of the transfer */
    direction: 'in' | 'out' | 'self'
    /** Quantity details of the transfer */
    quantity: Quantity
    /** Value of the transfer in requested currency */
    value: number
    /** Historical price of the asset */
    price: number
    /** Address of the sender of the transfer */
    sender: string
    /** Address of the recipient of the transfer */
    recipient: string
}

interface Approval {
    fungible_info?: FungibleInfo
    nft_info?: NFTInfo
    /** Quantity details of the approval */
    quantity: Quantity
    /** Address of the sender of the approval */
    sender: string
}

interface Quantity {
    /** The integral representation of the quantity (123.45678 -> 12345678) */
    int: string
    /** Decimal number precision of the quantity - digits after the floating point */
    decimals: number
    /** Float representation of the quantity */
    float: number
    /** String representation of the quantity */
    numeric: string
}

interface FungibleInfo {
    /** Displayable name of the fungible */
    name: string
    /** Displayable symbol of the fungible */
    symbol: string
    /** Brief description of the fungible */
    description?: string
    /** Icon related to fungible */
    icon?: {
        /** URL of the icon */
        url: string | null
    }
    flags: {
        /** Whether this fungible verified or not */
        verified: boolean
    }
    /** Implementation details of the fungible on various chains */
    implementations: FungibleImplementation[]
}

interface FungibleImplementation {
    /** Unique id of the chain */
    chain_id: string
    /** Implementation address on the chain */
    address?: string
    /** Number of decimals points of the implementation */
    decimals: number
}

interface NFTInfo {
    /** Address of the contract of the NFT */
    contract_address: string
    /** Unique identifier of the NFT inside the contract */
    token_id: string | null
    /** Name of the NFT */
    name?: string
    /** The standard that the NFT contract follows */
    interface?: 'erc721' | 'erc1155'
    /** Content associated with the NFT */
    content?: NFTContent
    flags?: {
        /** Indicates whether the NFT spam or not */
        is_spam?: boolean
    }
}

interface NFTContent {
    /** The URL of the preview image */
    preview?: ContentLink
    /** The URL of the full-size image */
    detail?: ContentLink
    /** The URL of the audio file */
    audio?: ContentLink
    /** The URL of the video file */
    video?: ContentLink
}

interface ContentLink {
    /** URL to the content */
    url: string
    /** MIME content type */
    content_type?: string
}

interface DAppInfo {
    /** Human readable representation of DApp, that wallet interacted to */
    name: string
    icon?: {
        /** URL of the icon */
        url: string | null
    }
    /** The address of the executed contract */
    contract_address: string
    method?: {
        /** Execution method id. First 4 bytes of keccak256 of method signature in hex format */
        id: string
        /** Human readable name of the method */
        name: string
    }
}

interface ChainRelationship {
    links: {
        /** URL to the current chain */
        related: string
    }
    data: {
        /** Chain resource type */
        type: 'chains'
        /** Chain unique identifier */
        id: string
    }
}

interface DappRelationship {
    data: {
        /** Decentralized application resource type */
        type: 'dapps'
        /** Decentralized application ID */
        id: string
    }
}

interface RequestConfig {
    /** Address of the wallet */
    address: string
    /** Query parameters */
    params?: TransactionQueryParams
    headers?: {
        /** Custom header that allows to get data for testnets */
        'X-Env'?: 'testnet'
    }
}

/**
 * Get list of wallet's transactions
 *
 * This endpoint returns a list of transactions associated with the wallet.
 * Supports testnets via X-Env header.
 *
 * NOTE2: This endpoint supports a lot of filters, sorting, and pagination parameters.
 * Make sure that your request URL length is safe for your platform.
 * Usually, 2000 characters are the safe limit in virtually any combination of client and server software.
 * NOTE2: Consider all IDs as abstract strings, without making any assumptions
 * about their format or relying on such assumptions. There is a non-zero
 * probability that IDs may change in the future, and this should not result in
 * any breaking changes.
 */
export type GetWalletTransactions = (config: RequestConfig) => Promise<TransactionsResponse>
