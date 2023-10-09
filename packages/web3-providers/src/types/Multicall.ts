import type { UnboxTransactionObject } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'

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
}
