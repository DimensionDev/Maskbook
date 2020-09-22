import type { Contract } from 'web3-eth-contract'
import { useMulticallContract } from '../contracts/useMulticallContract'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'

interface Call<T> {
    address: string
    data: T
}

/**
 * Call a contract method with multiple data
 * @param contract A contract instance
 * @param name A method name of the contract instance
 * @returns The method call results
 */
export function useSingleContractMultipleData<
    T extends Contract,
    M extends keyof T['methods'],
    A extends Parameters<T['methods'][M]>,
    R extends ReturnType<T['methods'][M]>
>(contract: T, name: string, calls: Call<A>[]): R[] {
    const MULTICALL_ADDRESS = useConstant(CONSTANTS, 'MULTICALL_ADDRESS')
    const multicallContract = useMulticallContract(MULTICALL_ADDRESS)
    return []
}

export function useMutlipleContractSingleData() {
    const MULTICALL_ADDRESS = useConstant(CONSTANTS, 'MULTICALL_ADDRESS')
    const multicallContract = useMulticallContract(MULTICALL_ADDRESS)
}

export function useMultipleContractMultipleData() {
    const MULTICALL_ADDRESS = useConstant(CONSTANTS, 'MULTICALL_ADDRESS')
    const multicallContract = useMulticallContract(MULTICALL_ADDRESS)
}
