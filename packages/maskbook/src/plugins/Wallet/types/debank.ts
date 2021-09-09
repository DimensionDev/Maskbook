export enum DebankTransactionDirection {
    SEND = 'send',
    RECEIVE = 'receive',
}

export interface DictItem {
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
}

export interface HistoryItem {
    cate_id: keyof HistoryResponse['data']['cate_dict']
    // TODO:
    // implement debt_liquidated
    debt_liquidated: null
    id: string
    other_addr: string
    project_id?: string
    receives: AmountTokenPair[]
    sends: AmountTokenPair[]
    spot_trade?: SpotTrade
    time_at: number
    token_approve?: TokenApprove
    tx?: Record
}

export interface AmountTokenPair {
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
    eth_gas_fee: number
    from_addr: string
    name: string
    // Note: this is JSON string
    params: string
    // Note: 0 - failed, 1 - succeed
    status: 0 | 1
    to_addr: string
    usd_gas_fee: number
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
    chain: 'eth' | 'bsc' | string
    decimals: number
    display_symbol: null
    id: 'eth' | string
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
