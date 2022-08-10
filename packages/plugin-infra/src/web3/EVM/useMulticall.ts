import { useState, useCallback, useMemo } from 'react'
import type { AbiOutput } from 'web3-utils'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import {
    ChainId,
    decodeOutputString,
    encodeContractTransaction,
    UnboxTransactionObject,
} from '@masknet/web3-shared-evm'
import type { BaseContract, NonPayableTx } from '@masknet/web3-contracts/types/types'
import type { Multicall } from '@masknet/web3-contracts/types/Multicall'
import { useMulticallContract } from './useMulticallContract'
import { useChainId } from '../useChainId'
import { useWeb3 } from '../useWeb3'
import { useWeb3Connection } from '../useWeb3Connection'

// #region types
// [target, gasLimit, callData]
type Call = [string, number, string]

// [succeed, gasUsed, result]
type Result = [boolean, string, string]

// conservative, hard-coded estimate of the current block gas limit
const CONSERVATIVE_BLOCK_GAS_LIMIT = 10_000_000

// the default value for calls that don't specify gasRequired
const DEFAULT_GAS_REQUIRED = 200_000
const DEFAULT_GAS_LIMIT = 1_000_000
// #endregion

// #region cached results
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
// #endregion

// #region useMulticallCallback
export enum MulticallStateType {
    UNKNOWN = 0,
    /** Wait for tx call */
    PENDING = 1,
    /** Tx call resolved */
    SUCCEED = 2,
    /** Tx call rejected */
    FAILED = 3,
}

export type MulticallState =
    | { type: MulticallStateType.UNKNOWN }
    | { type: MulticallStateType.PENDING }
    | { type: MulticallStateType.SUCCEED; results: Result[] }
    | { type: MulticallStateType.FAILED; error: Error }

/**
 * The basic hook for fetching data from the Multicall contract
 * @param calls
 */
export function useMulticallCallback(targetChainId?: ChainId, targetBlockNumber?: number) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, targetChainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const multicallContract = useMulticallContract(chainId)
    const [multicallState, setMulticallState] = useState<MulticallState>({
        type: MulticallStateType.UNKNOWN,
    })

    const multicallCallback = useCallback(
        async (calls: Call[], overrides?: NonPayableTx) => {
            if (calls.length === 0 || !multicallContract || !chainId) {
                setMulticallState({
                    type: MulticallStateType.UNKNOWN,
                })
                return
            }

            const blockNumber = targetBlockNumber ?? (await connection?.getBlockNumber()) ?? 0

            try {
                setMulticallState({
                    type: MulticallStateType.PENDING,
                })

                // filter out cached calls
                const unresolvedCalls = calls.filter((call_) => !getCallResult(call_, chainId, blockNumber))

                // resolve the calls by chunks
                if (unresolvedCalls.length) {
                    await Promise.all(
                        chunkArray(unresolvedCalls).map(async (chunk) => {
                            // we don't mind the actual block number of the current call
                            if (!connection) return
                            const web3 = await connection.getWeb3()
                            const tx = await encodeContractTransaction(
                                multicallContract,
                                multicallContract.methods.multicall(chunk),
                                overrides,
                            )
                            const hex = await connection.callTransaction(tx)

                            const outputType = multicallContract.options.jsonInterface.find(
                                ({ name }) => name === 'multicall',
                            )?.outputs

                            if (!outputType) return

                            const decodeResult = decodeOutputString(web3, outputType, hex) as
                                | UnboxTransactionObject<ReturnType<Multicall['methods']['multicall']>>
                                | undefined

                            if (!decodeResult) return

                            decodeResult.returnData.forEach((result, index) =>
                                setCallResult(chunk[index], result, chainId, blockNumber),
                            )
                        }),
                    )
                }
                setMulticallState({
                    type: MulticallStateType.SUCCEED,
                    results: calls.map((call) => getCallResult(call, chainId, blockNumber) ?? [false, '0x0', '0x0']),
                })
            } catch (error) {
                if (error instanceof Error) {
                    setMulticallState({
                        type: MulticallStateType.FAILED,
                        error,
                    })
                }
                throw error
            }
        },
        [chainId, targetBlockNumber, multicallContract, connection],
    )
    return [multicallState, multicallCallback] as const
}
// #endregion

// #region useMulticallStateDecoded
export function useMulticallStateDecoded<
    T extends BaseContract,
    K extends keyof T['methods'],
    R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>,
>(contracts: T[], names: K[], state: MulticallState, chainId?: ChainId) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    type Result = { succeed: boolean; gasUsed: string } & ({ error: any; value: null } | { error: null; value: R })
    return useMemo(() => {
        if (!web3 || state.type !== MulticallStateType.SUCCEED || contracts.length !== state.results.length) return []
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
            } catch (error) {
                return { succeed: false, gasUsed, value: null, error }
            }
        })
    }, [web3, contracts.map((x) => x.options.address).join(), names.join(), state])
}
// #endregion

export function useSingleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
    contract: T | null,
    names: K[],
    callDatas: Array<Parameters<T['methods'][K]>>,
    gasLimit = DEFAULT_GAS_LIMIT,
    chainId?: ChainId,
    blockNumber?: number,
) {
    const calls = useMemo(() => {
        if (!contract) return []
        return callDatas.map<Call>((data, i) => [
            contract.options.address,
            gasLimit,
            contract.methods[names[i]](...data).encodeABI() as string,
        ])
    }, [contract?.options.address, names.join(), callDatas.flatMap((x) => x).join()])
    const [state, callback] = useMulticallCallback(chainId, blockNumber)
    const results = useMulticallStateDecoded(
        Array.from({ length: calls.length }).fill(contract) as T[],
        names,
        state,
        chainId,
    )
    return [results, calls, state, callback] as const
}

export function useMultipleContractSingleData<T extends BaseContract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callData: Parameters<T['methods'][K]>,
    chainId?: ChainId,
    blockNumber?: number,
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

    const [state, callback] = useMulticallCallback(chainId, blockNumber)
    const results = useMulticallStateDecoded(contracts, names, state, chainId)
    return [results, calls, state, callback] as const
}

export function useMultipleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
    contracts: T[],
    names: K[],
    callDatas: Array<Parameters<T['methods'][K]>>,
    gasLimit = DEFAULT_GAS_LIMIT,
    chainId?: ChainId,
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
    const [state, callback] = useMulticallCallback(chainId)
    const results = useMulticallStateDecoded(contracts, names, state, chainId)
    return [results, calls, state, callback] as const
}
