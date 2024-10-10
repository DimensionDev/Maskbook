// cspell:disable
export enum DebankTransactionDirection {
    SEND = 'send',
    RECEIVE = 'receive',
}

/**
 * Collect from https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
 */
export type DebankChains =
    | 'arb'
    | 'astar'
    | 'aurora'
    | 'avax'
    | 'base'
    | 'boba'
    | 'brise'
    | 'bsc'
    | 'btt'
    | 'canto'
    | 'celo'
    | 'cfx'
    | 'cro'
    | 'dfk'
    | 'doge'
    | 'eth'
    | 'evmos'
    | 'ftm'
    | 'fuse'
    | 'heco'
    | 'hmy'
    | 'iotx'
    | 'kava'
    | 'kcc'
    | 'klay'
    | 'mada'
    | 'matic'
    | 'metis'
    | 'mobm'
    | 'movr'
    | 'nova'
    | 'okt'
    | 'op'
    | 'palm'
    | 'pls'
    | 'rsk'
    | 'sbch'
    | 'scrl'
    | 'sdn'
    | 'sgb'
    | 'step'
    | 'swm'
    | 'tlos'
    | 'wan'
    | 'xdai'

export interface DictItem {
    name: string
    id: string
    cn: string
    en: string
}

export interface ProjectItem {
    id: string
    log_url: string
    name: Omit<DictItem, 'id'>
}

export interface TokenItem {
    decimals: number
    display_symbol?: string
    id: string
    is_core: boolean
    is_swap_common?: boolean
    is_swap_hot?: boolean
    is_verified: boolean
    logo_url: string
    name: string
    optimized_symbol: string
    price: number
    symbol: string
    time_at: number
    contract_id: string
    /** Only NFT */
    is_erc721: boolean
    /** Only NFT */
    is_erc1155: boolean
    collection?: {
        chain: DebankChains
        credit_score: number
        description: string | null
        floor_price: number
        /** e.g. 'matic:0x813de35e46a7d3a6ea1df82414dfadd5b283d9a9' */
        id: string
        is_core: boolean
        is_scam: boolean
        is_suspicious: boolean
        is_verified: boolean
        logo_url: string
        name: string
    }
}

export interface HistoryItem {
    cate_id: keyof HistoryResponse['data']['cate_dict']
    debt_liquidated: null
    id: string
    chain: DebankChains
    other_addr: string
    project_id?: string
    receives: TransferringAsset[]
    sends: TransferringAsset[]
    spot_trade?: SpotTrade
    time_at: number
    token_approve?: TokenApprove
    tx?: Record
    is_scam: boolean
}

export interface TransferringAsset {
    amount: number
    to_addr: string
    token_id: string
}

export interface SpotTrade {
    dex_id: string
    pay_token_amount: number
    pay_token_id: string
    receive_token_amount: number
    receive_token_id: string
}

export interface TokenApprove {
    spender: string
    token_id: string
    value: number
}

export interface Record {
    eth_gas_fee?: number
    from_addr: string
    name: string
    // Note: this is JSON string
    params: string
    // Note: 0 - failed, 1 - succeed
    status: 0 | 1
    to_addr: string
    usd_gas_fee?: number
    value: number
}

export interface HistoryRecord {
    cate_dict: {
        approve: DictItem
        receive: DictItem
        send: DictItem
        spot_trade: DictItem
    }
    history_list: HistoryItem[]
    project_dict: {
        [key in string]: ProjectItem
    }
    token_dict: {
        [key in string | 'eth']: TokenItem
    }
}

export interface BalanceRecord {
    balance: number
    chain: DebankChains
    decimals: number
    display_symbol: null
    id: LiteralUnion<'eth'>
    is_core: boolean
    is_swap_common: boolean
    is_swap_hot: null
    is_verified: boolean
    logo_url: string
    name: string
    optimized_symbol: string
    price: number
    symbol: string
    time_at: null
}

export interface WalletTokenRecord {
    /** Could be chain or token address */
    id: LiteralUnion<DebankChains, string>
    amount: string
    is_wallet: boolean
    protocol_id: string
    chain: DebankChains
    decimals: number
    display_symbol: null
    is_core: boolean
    is_verified: boolean
    logo_url: string
    name: string
    optimized_symbol: string
    price: number
    symbol: string
    time_at: null
}

export interface HistoryResponse {
    data: HistoryRecord
    error_code: number
    _cache_seconds: number
    _seconds: number
}

export interface BalanceListResponse {
    data?: BalanceRecord[]
    error_code: number
    _cache_seconds: number
    _seconds: number
}

export interface GasPriceRecord {
    estimated_seconds: number
    front_tx_count: number
    price: number
}

/**
 * Legacy gas response
 */
export interface GasPriceDictResponse {
    data: {
        fast: GasPriceRecord
        normal: GasPriceRecord
        slow: GasPriceRecord
        update_at: number
    }
    error_code: number
    _seconds: number
}

export type GasPriceResponse = [
    {
        level: 'slow'
        front_tx_count: number
        price: number
        estimated_seconds: number
    },
    {
        level: 'normal'
        front_tx_count: number
        price: number
        estimated_seconds: number
    },
    {
        level: 'fast'
        front_tx_count: number
        price: number
        estimated_seconds: number
    },
]

export interface UserTotalBalance {
    total_usd_value: number
    chain_list: Array<{
        id: string
        community_id: number
        name: string
        native_token_id: string
        logo_url: string
        wrapped_token_id: string
        usd_value: number
    }>
}
