import type { TransactionDetailed } from '@masknet/web3-shared-evm'

export namespace ExplorerAPI {
    export type Transaction = Partial<TransactionDetailed> & {
        from: string
        hash: string
        input: string
        to: string | null
        value: string | bigint
        status: '0' | '1'
        confirmations: number
    }

    export interface Options {
        offset?: number
    }
}
