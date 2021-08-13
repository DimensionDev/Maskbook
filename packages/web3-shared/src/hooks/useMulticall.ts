import { useState, useCallback, useMemo } from 'react'
import type { AbiOutput } from 'web3-utils'
import type { UnboxTransactionObject } from '../types'
import type { BaseContract, NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useMulticallContract } from '../contracts/useMulticallContract'
import { decodeOutputString } from '../utils'
import { useWeb3 } from './useWeb3'

//#region useMulticallCallback
// [address, callData, gasLimit] or [address, callData]
type Call = [string, string, number] | [string, string]

const DEFAULT_GAS_LIMIT = 1_000_000

export enum MulticalStateType {
    UNKNOWN = 0,
    /** Wait for tx call */
    PENDING = 1,
    /** Tx call resolved */
    SUCCEED = 2,
    /** Tx call rejected */
    FAILED = 3,
}

export type MulticalState =
    | { type: MulticalStateType.UNKNOWN }
    | { type: MulticalStateType.PENDING }
    | { type: MulticalStateType.SUCCEED; results: [boolean, string, string][] }
    | { type: MulticalStateType.FAILED; error: Error }

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
        async (calls_: Call[], overrides?: NonPayableTx) => {
            const calls = calls_.map<[string, number, string]>((x) => [x[0], x[2] ?? DEFAULT_GAS_LIMIT, x[1]])
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

                const { returnData } = await multicallContract.methods.multicall(calls).call(overrides)

                setMulticallState({
                    type: MulticalStateType.SUCCEED,
                    results: returnData,
                })
            } catch (error) {
                if (error instanceof Error) {
                    setMulticallState({
                        type: MulticalStateType.FAILED,
                        error,
                    })
                }
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
    type Result = { succeed: boolean; gasUsed: string } & ({ error: any; value: null } | { error: null; value: R })
    return useMemo(() => {
        if (state.type !== MulticalStateType.SUCCEED) return []
        if (contracts.length !== state.results.length) return []
        return state.results.map(([succeed, gasUsed, result], index): Result => {
            // the ignore formatter for better reading
            // prettier-ignore
            const outputs: AbiOutput[] = (
                contracts[index].options.jsonInterface
                    .find(({ type, name }) => type === 'function' && name === names[index])
                    ?.outputs ?? []
            )
            try {
                const value = decodeOutputString(web3, outputs, result) as R
                return { succeed, gasUsed, value, error: null }
            } catch (error: any) {
                return { succeed, gasUsed, value: null, error }
            }
        })
    }, [web3, contracts.map((x) => x.options.address).join(), names.join(), state])
}
//#endregion

export function useSingleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
    contract: T | null,
    names: K[],
    callDatas: Parameters<T['methods'][K]>[],
    gasLimit = DEFAULT_GAS_LIMIT,
) {
    const calls = useMemo(() => {
        if (!contract) return []
        return callDatas.map<[string, string, number]>((data, i) => [
            contract.options.address,
            contract.methods[names[i]](...data).encodeABI() as string,
            gasLimit,
        ])
    }, [contract?.options.address, names.join(), callDatas.flatMap((x) => x).join()])
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(Array.from({ length: calls.length }).fill(contract) as T[], names, state)
    return [results, calls, state, callback] as const
}

export function useMutlipleContractSingleData<T extends BaseContract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callData: Parameters<T['methods'][K]>,
    gasLimit = DEFAULT_GAS_LIMIT,
) {
    const calls = useMemo(
        () =>
            contracts.map<[string, string, number]>((contract, i) => [
                contract.options.address,
                contract.methods[names[i]](...callData).encodeABI() as string,
                gasLimit,
            ]),
        [contracts.map((x) => x.options.address).join(), names.join(), callData.join()],
    )
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, calls, state, callback] as const
}

export function useMultipleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callDatas: Parameters<T['methods'][K]>[],
    gasLimit = DEFAULT_GAS_LIMIT,
) {
    const calls = useMemo(
        () =>
            contracts.map<[string, string, number]>((contract, i) => [
                contract.options.address,
                contract.methods[names[i]](callDatas[i]).encodeABI() as string,
                gasLimit,
            ]),
        [contracts.map((x) => x.options.address).join(), names.join(), callDatas.flatMap((x) => x).join(), gasLimit],
    )
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, calls, state, callback] as const
}
