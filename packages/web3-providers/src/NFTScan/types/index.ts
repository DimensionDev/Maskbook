export * from './EVM.js'
export * from './Solana.js'

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
