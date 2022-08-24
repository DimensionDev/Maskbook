export * from './EVM'
export * from './Solana'

export interface Response<T> {
    data: T
}

export interface PageableResponse<T> {
    data: {
        content: T[]
        next?: string
        total?: number
    }
}
