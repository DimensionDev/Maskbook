const DEBANK_API = 'https://api.debank.com'

export interface DICT_ITEM {
    id: string
    cn: string
    en: string
}

export interface PROJECT_ITEM {
    id: string
    log_url: string
    name: Omit<DICT_ITEM, 'id'>
}

export interface TOKEN_ITEM {
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

export interface HISTRORY_ITEM {
    cate_id: string
    // TODO:
    // implement debt_liquidated
    debt_liquidated: null
    id: string
    other_addr: string
    project_id?: string
    receives: {
        amount: number
        to_addr: string
        token_id: string
    }[]
    sends: {
        amount: number
        to_addr: string
        token_id: string
    }[]
    spot_trade?: {
        dex_id: string
        pay_token_amount: number
        pay_token_id: string
        receive_token_amount: number
        receive_token_id: string
    }
    time_at: number
    token_approve?: {
        spender: string
        token_id: string
        value: number
    }
    tx?: {
        eth_gas_fee: number
        from_addr: string
        name: string
        params: string
        // 0 - failed, 1 - succeed
        status: 0 | 1
        to_addr: string
        usd_gas_fee: number
        value: number
    }
}

export interface HISTORY_RESPONSE {
    data: {
        cate_dict: {
            approve: DICT_ITEM
            receive: DICT_ITEM
            send: DICT_ITEM
            spot_trade: DICT_ITEM
        }
        history_list: HISTRORY_ITEM[]
        project_dict: {
            [key in string]: PROJECT_ITEM
        }
        token_dict: {
            [key in string | 'eth']: TOKEN_ITEM
        }
    }
    error_code: number
    _cache_seconds: number
    _seconds: number
}

export async function getTransactionList(address: string) {
    const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}`)
    return (await response.json()) as HISTORY_RESPONSE
}
