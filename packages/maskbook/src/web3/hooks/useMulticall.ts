import { useState, useCallback, useMemo } from 'react'
import type { Contract } from 'web3-eth-contract'
import type { AbiOutput } from 'web3-utils'
import type { TransactionObject } from '../../contracts/types'
import { useMulticallContract } from '../contracts/useMulticallContract'
import { decodeOutputString } from '../helpers'
import { nonFunctionalWeb3 } from '../web3'

//#region useMulticallCallback
interface Call {
    target: string
    callData: string
}

export enum MulticalStateType {
    UNKNOWN,
    /** Wait for tx call */
    PENDING,
    /** Tx call resolved */
    SUCCEED,
    /** Tx call rejected */
    FAILED,
}

export type MulticalState =
    | {
          type: MulticalStateType.UNKNOWN
      }
    | {
          type: MulticalStateType.PENDING
      }
    | {
          type: MulticalStateType.SUCCEED
          results: string[]
      }
    | {
          type: MulticalStateType.FAILED
          error: Error
      }

/**
 * The basic hook for fetching data from Multicall contract
 * @param calls
 */
export function useMulticallCallback(calls: Call[]) {
    const multicallContract = useMulticallContract()
    const [multicallState, setMulticallState] = useState<MulticalState>({
        type: MulticalStateType.UNKNOWN,
    })
    const multicallCallback = useCallback(async () => {
        if (calls.length === 0 || !multicallContract) {
            setMulticallState({
                type: MulticalStateType.UNKNOWN,
            })
            return
        }
        try {
            setMulticallState({
                type: MulticalStateType.PENDING,
            })

            const { blockNumber, returnData } = await multicallContract.methods.aggregate(calls).call()

            setMulticallState({
                type: MulticalStateType.SUCCEED,
                results: returnData,
            })
        } catch (error) {
            setMulticallState({
                type: MulticalStateType.FAILED,
                error,
            })
        }
    }, [calls, multicallContract])
    return [multicallState, multicallCallback] as const
}
//#endregion

//#region useMutlicallStateDecoded
type UnboxTransactionObject<T> = T extends TransactionObject<infer R> ? R : T

export function useMutlicallStateDecoded<
    T extends Contract,
    K extends keyof T['methods'],
    R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>
>(contracts: T[], names: K[], state: MulticalState) {
    return useMemo(() => {
        if (state.type !== MulticalStateType.SUCCEED) return []
        if (contracts.length !== state.results.length) return []
        return state.results.map((raw, i) => {
            const outputs =
                contracts[i].options.jsonInterface.find((x) => x.type === 'function' && x.name === names[i])?.outputs ??
                ([] as AbiOutput[])
            try {
                return {
                    raw,
                    error: null,
                    value: decodeOutputString(nonFunctionalWeb3, outputs, raw) as R,
                }
            } catch (error) {
                return {
                    raw,
                    error: error as Error,
                    value: null,
                }
            }
        })
    }, [contracts.map((x) => x.options.address).join(','), names, state])
}
//#endregion

export function useSingleContractMultipleData<T extends Contract, K extends keyof T['methods']>(
    contract: T | null,
    names: K[],
    callDatas: Parameters<T['methods'][K]>[],
) {
    const calls = useMemo(() => {
        if (!contract) return []
        return callDatas.map((data, i) => ({
            target: contract.options.address,
            callData: contract.methods[names[i]](...data).encodeABI() as string,
        }))
    }, [contract, names, callDatas])
    const [state, callback] = useMulticallCallback(calls)
    const results = useMutlicallStateDecoded(new Array(calls.length).fill(contract) as T[], names, state)
    return [results, state, callback] as const
}

export function useMutlipleContractSingleData<T extends Contract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callData: Parameters<T['methods'][K]>,
) {
    const calls = useMemo(
        () =>
            contracts.map((contract, i) => ({
                target: contract.options.address,
                callData: contracts[0].methods[names[i]](callData).encodeABI() as string,
            })),
        [contracts, names, callData],
    )
    const [state, callback] = useMulticallCallback(calls)
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, state, callback] as const
}

export function useMultipleContractMultipleData<T extends Contract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callDatas: Parameters<T['methods'][K]>[],
) {
    const calls = useMemo(
        () =>
            contracts.map((contract, i) => ({
                target: contract.options.address,
                callData: contracts[0].methods[names[i]](callDatas[i]).encodeABI() as string,
            })),
        [contracts, names, callDatas],
    )
    const [state, callback] = useMulticallCallback(calls)
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, state, callback] as const
}
