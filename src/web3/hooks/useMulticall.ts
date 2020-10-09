import type { Contract } from 'web3-eth-contract'
import { useMulticallContract } from '../contracts/useMulticallContract'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'
import { useState, useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import { nonFunctionalWeb3 } from '../web3'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import type { Erc20 } from '../../contracts/splitter/ERC20'

//#region useMulticallCallback
interface Call {
    target: string
    callData: string
}

export enum MulticalStateType {
    UNKNOWN,
    PENDING,
    SUCCEED,
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
        if (!multicallState || !multicallContract) {
            setMulticallState({
                type: MulticalStateType.UNKNOWN,
            })
            return
        }
        try {
            setMulticallState({
                type: MulticalStateType.PENDING,
            })
            const { returnData } = await multicallContract.methods
                .aggregate(calls as { target: string; callData: string }[])
                .call()

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
    }, [calls])
    return [multicallState, multicallCallback]
}
//#endregion

export function useSingleContractMultipleData<T extends Contract, M extends keyof T['methods']>(
    contract: T,
    name: string,
    callDatas: Parameters<T['methods'][M]>[],
) {
    const calls = useMemo(() => {
        return callDatas.map((data) => ({
            target: contract.options.address,
            callData: contract.methods[name](...data).encodeABI() as string,
        }))
    }, [contract, name, callDatas])
    return useMulticallCallback(calls)
}

export function useMutlipleContractSingleData<T extends Contract, M extends keyof T['methods']>(
    contracts: T[],
    name: string,
    callData: Parameters<T['methods'][M]>,
) {
    const calls = useMemo(() => {
        return contracts.map((contract) => ({
            target: contract.options.address,
            callData: contracts[0].methods[name](callData).encodeABI() as string,
        }))
    }, [contracts, name, callData])
    return useMulticallCallback(calls)
}

export function useMultipleContractMultipleData<T extends Contract, M extends keyof T['methods']>(
    contracts: T[],
    name: string,
    callDatas: Parameters<T['methods'][M]>,
) {
    const calls = useMemo(() => {
        return contracts.map((contract, idx) => ({
            target: contract.options.address,
            callData: contracts[0].methods[name](callDatas[idx]).encodeABI() as string,
        }))
    }, [contracts, name, callDatas])
    return useMulticallCallback(calls)
}
