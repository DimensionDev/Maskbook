export interface Status {
    credit_count: number
    elapsed: number
    error_code: number
    error_message: null | string
    notice: null | string
    timestamp: string
}

export interface Currency {
    id: number
    name: string
    symbol: string
    token: string
    space: string
}

export interface ResultData<T> {
    data: T
    status: Status
}

// #region get all coins
export interface Coin {
    id: number
    name: string
    platform?: {
        id: string
        name: string
        slug: string
        symbol: string
        token_address: string
    }
    rank: number
    slug: string
    status: 'active' | 'untracked'
    symbol: string
}
// #endregion
