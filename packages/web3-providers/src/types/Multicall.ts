import type Web3 from 'web3'
import type { ChainId, UnboxTransactionObject } from '@masknet/web3-shared-evm'
import type { BaseContract, NonPayableTx } from '@masknet/web3-contracts/types/types.js'

export namespace MulticallBaseAPI {
    // [target, gasLimit, callData]
    export type Call = [string, number, string]

    // [succeed, gasUsed, result]
    export type Result = [boolean, string, string]

    export type DecodeResult<
        T extends BaseContract,
        K extends keyof T['methods'],
        R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>,
    > = {
        succeed: boolean
        gasUsed: string
    } & (
        | {
              error: any
              value: null
          }
        | {
              error: null
              value: R
          }
    )

    export type Callback<
        T extends BaseContract,
        K extends keyof T['methods'],
        R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>,
    > = (
        web3: Web3,
        contracts: T[],
        names: K[],
        calls: Call[],
        overrides?: NonPayableTx,
    ) => Promise<Array<DecodeResult<T, K, R>>>

    export interface Provider {
        /**
         * Create a multicall callback
         * @param chainId
         * @param blockNumber
         */
        createCallback<
            T extends BaseContract,
            K extends keyof T['methods'],
            R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>,
        >(
            chainId: ChainId,
            blockNumber?: number,
        ): Callback<T, K, R>
    }
}
