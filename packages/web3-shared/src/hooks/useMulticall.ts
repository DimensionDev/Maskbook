import { useState, useCallback, useMemo } from 'react'
import type { AbiOutput } from 'web3-utils'
import type { ChainId, UnboxTransactionObject } from '../types'
import type { BaseContract, NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useMulticallContract } from '../contracts/useMulticallContract'
import { decodeOutputString } from '../utils'
import { useWeb3 } from './useWeb3'
import { useBlockNumber } from './useBlockNumber'
import { useChainId } from './useChainId'

//#region types
// [target, gasLimit, callData]
type Call = [string, number, string]

// [succeed, gasUsed, result]
type Result = [boolean, string, string]

// conservative, hard-coded estimate of the current block gas limit
const CONSERVATIVE_BLOCK_GAS_LIMIT = 10_000_000

// the default value for calls that don't specify gasRequired
const DEFAULT_GAS_REQUIRED = 200_000
const DEFAULT_GAS_LIMIT = 1_000_000
//#endregion

//#region cached results
const cachedResults: {
    [chainId: number]: {
        blockNumber: number
        results: Record<string, Result>
    }
} = {}

function toCallKey(call: Call) {
    return call.join('-')
}

function getCallResult(call: Call, chainId: ChainId, blockNumber: number) {
    const cache = cachedResults[chainId]
    const blockNumber_ = cache?.blockNumber ?? 0
    if (blockNumber_ < blockNumber) return
    return cache.results[toCallKey(call)]
}

function setCallResult(call: Call, result: Result, chainId: ChainId, blockNumber: number) {
    const cache = cachedResults[chainId] ?? {
        results: [],
        blockNumber: 0,
    }
    const blockNumber_ = cache.blockNumber
    if (blockNumber_ > blockNumber) return
    if (blockNumber_ < blockNumber) cache.blockNumber = blockNumber
    cache.results[toCallKey(call)] = result
    cachedResults[chainId] = cache
}

// evenly distributes items among the chunks
function chunkArray(items: Call[], gasLimit = CONSERVATIVE_BLOCK_GAS_LIMIT * 10): Call[][] {
    const chunks: Call[][] = []
    let currentChunk: Call[] = []
    let currentChunkCumulativeGas = 0

    for (const item of items) {
        // calculate the gas required by the current item
        const gasRequired = item[1] ?? DEFAULT_GAS_REQUIRED

        // if the current chunk is empty, or the current item wouldn't push it over the gas limit,
        // append the current item and increment the cumulative gas
        if (currentChunk.length === 0 || currentChunkCumulativeGas + gasRequired < gasLimit) {
            currentChunk.push(item)
            currentChunkCumulativeGas += gasRequired
        } else {
            // otherwise, push the current chunk and create a new chunk
            chunks.push(currentChunk)
            currentChunk = [item]
            currentChunkCumulativeGas = gasRequired
        }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk)
    return chunks
}
//#endregion

//#region useMulticallCallback
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
    | { type: MulticalStateType.SUCCEED; results: Result[] }
    | { type: MulticalStateType.FAILED; error: Error }

/**
 * The basic hook for fetching data from the Multicall contract
 * @param calls
 */
export function useMulticallCallback() {
    const chainId = useChainId()
    const blockNumber = useBlockNumber()
    const multicallContract = useMulticallContract()
    const [multicallState, setMulticallState] = useState<MulticalState>({
        type: MulticalStateType.UNKNOWN,
    })
    const multicallCallback = useCallback(
        async (calls: Call[], overrides?: NonPayableTx) => {
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

                // filter out cached calls
                const unresolvedCalls = calls.filter((call_) => !getCallResult(call_, chainId, blockNumber))

                // resolve the calls by chunks
                if (unresolvedCalls.length) {
                    await Promise.all(
                        chunkArray(unresolvedCalls).map(async (chunk) => {
                            // we don't mind the actual block number of the current call
                            const { returnData } = await multicallContract.methods.multicall(chunk).call(overrides)
                            returnData.forEach((result, index) =>
                                setCallResult(chunk[index], result, chainId, blockNumber),
                            )
                        }),
                    )
                }
                setMulticallState({
                    type: MulticalStateType.SUCCEED,
                    results: calls.map((call) => getCallResult(call, chainId, blockNumber) ?? [false, '0x0', '0x0']),
                })
            } catch (error) {
                if (error instanceof Error) {
                    setMulticallState({
                        type: MulticalStateType.FAILED,
                        error,
                    })
                }
                throw error
            }
        },
        [chainId, blockNumber, multicallContract],
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
                return { succeed: false, gasUsed, value: null, error }
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
        return callDatas.map<Call>((data, i) => [
            contract.options.address,
            gasLimit,
            contract.methods[names[i]](...data).encodeABI() as string,
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
            contracts.map<Call>((contract, i) => [
                contract.options.address,
                gasLimit,
                contract.methods[names[i]](...callData).encodeABI() as string,
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
            contracts.map<Call>((contract, i) => [
                contract.options.address,
                gasLimit,
                contract.methods[names[i]](callDatas[i]).encodeABI() as string,
            ]),
        [contracts.map((x) => x.options.address).join(), names.join(), callDatas.flatMap((x) => x).join(), gasLimit],
    )
    const [state, callback] = useMulticallCallback()
    const results = useMutlicallStateDecoded(contracts, names, state)
    return [results, calls, state, callback] as const
}
