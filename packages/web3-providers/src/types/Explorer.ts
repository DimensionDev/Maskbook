import type { ChainId } from '@masknet/web3-shared-evm'
import type { Transaction as Web3Transaction } from 'web3-core'

export namespace ExplorerAPI {
    export type Transaction = Web3Transaction & {
        status: '0' | '1'
        confirmations: number
    }

    export interface Options {
        offset?: number
    }

    export interface Provider {
        getLatestTransactions(chainId: ChainId, account: string, options?: Options): Promise<Transaction[]>
    }
}
