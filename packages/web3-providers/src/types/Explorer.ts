import type { Transaction as Web3Transaction } from 'web3-core'

export namespace ExplorerAPI {
    export type Transaction = Web3Transaction & {
        status: '0' | '1'
        confirmations: number
    }

    export interface Options {
        offset?: number
    }
}
