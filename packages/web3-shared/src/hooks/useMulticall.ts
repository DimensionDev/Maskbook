import { useState, useCallback, useMemo } from 'react'
import type { AbiOutput } from 'web3-utils'
import type { UnboxTransactionObject } from '../types'
import type { BaseContract } from '@masknet/contracts/types/types'
import { useMulticallContract } from '../contracts/useMulticallContract'
import { decodeOutputString } from '../utils'
import { useWeb3 } from './useWeb3'

//#region useMulticallCallback
type Call = [string, string]

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
 * The basic hook for fetching data from the Multicall contract
 * @param calls
 */
export function useMulticallCallback() {
    const multicallContract = useMulticallContract()
    const [multicallState, setMulticallState] = useState<MulticalState>({
        type: MulticalStateType.UNKNOWN,
    })
    const multicallCallback = useCallback(
        async (calls_: Call[]) => {
            if (calls_.length === 0 || !multicallContract) {
                setMulticallState({
                    type: MulticalStateType.UNKNOWN,
                })
                return
            }
            try {
                setMulticallState({
                    type: MulticalStateType.PENDING,
                })

                const { returnData } = await multicallContract.methods.aggregate(calls_).call()

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
        },
        [multicallContract],
    )
    return [multicallState, multicallCallback] as const
}
//#endregion

//#region useMutlicallStateDecoded
export function useMutlicallStateDecoded<
    T extends BaseContract,
    K extends keyof T['methods'],
    R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>,
>(contracts: T[], names: K[], state: MulticalState) {
    const web3 = useWeb3()
    return useMemo(() => {
        if (state.type !== MulticalStateType.SUCCEED) return []
        if (contracts.length !== state.results.length) return []
        return state.results.map((raw, i) => {
            const outputs: AbiOutput[] =
                contracts[i].options.jsonInterface.find((x) => x.type === 'function' && x.name === names[i])?.outputs ??
                []
            try {
                return {
                    raw,
                    error: null,
                    value: decodeOutputString(web3, outputs, raw) as R,
                }
            } catch (error) {
                return {
                    raw,
                    error: error as Error,
                    value: null,
                }
            }
        })
    }, [web3, contracts.map((x) => x.options.address).join(','), names.join(''), state])
}
//#endregion

export function useSingleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
    contract: T | null,
    names: K[],
    callDatas: Parameters<T['methods'][K]>[],
) {
    const calls = useMemo(() => {
        if (!contract) return []
        return callDatas.map<[string, string]>((data, i) => [
            contract.options.address,
            contract.methods[names[i]](...data).encodeABI() as string,
        ])
    }, [contract?.options.address, names.join(''), callDatas.flatMap((x) => x).join('')])
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(new Array(calls.length).fill(contract) as T[], names, state)
    return [results, calls, state, callback] as const
}

export function useMutlipleContractSingleData<T extends BaseContract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callData: Parameters<T['methods'][K]>,
) {
    const calls = useMemo(
        () =>
            contracts.map<[string, string]>((contract, i) => [
                contract.options.address,
                contract.methods[names[i]](...callData).encodeABI() as string,
            ]),
        [contracts.map((x) => x.options.address).join(''), names.join(''), callData.join('')],
    )
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, calls, state, callback] as const
}

export function useMultipleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callDatas: Parameters<T['methods'][K]>[],
) {
    const calls = useMemo(
        () =>
            contracts.map<[string, string]>((contract, i) => [
                contract.options.address,
                contract.methods[names[i]](callDatas[i]).encodeABI() as string,
            ]),
        [contracts.map((x) => x.options.address).join(''), names.join(''), callDatas.flatMap((x) => x).join('')],
    )
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, calls, state, callback] as const
}
