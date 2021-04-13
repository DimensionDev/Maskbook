import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { createContract } from './useContract'
import { useAccount } from './useAccount'
import { ERC165_INTERFACE_ID } from '../constants'
import type { AbiItem } from 'web3-utils'
import { useSuspense } from '../../utils/hooks/useSuspense'

const cache = new Map<string, [0, Promise<void>] | [1, boolean] | [2, Error]>()

export function ERC165ErrorRetry() {
    cache.forEach(([status], id) => status === 2 && cache.delete(id))
}

export function useERC165(address: string, interfaceId: string) {
    return useSuspense<boolean, [string, string]>(address, [address, interfaceId], cache, Suspender)
}

async function Suspender(address: string, interfaceId: string): Promise<boolean> {
    const account = useAccount()
    const contract = createContract<Qualification>(account, address, QualificationABI as AbiItem[])
    if (!contract) return false
    try {
        const isERC165 = await contract.methods.supportsInterface(ERC165_INTERFACE_ID).call({ from: account })
        const isVerify = await contract.methods.supportsInterface(interfaceId).call({ from: account })
        return isERC165 && isVerify
    } catch (e) {
        return false
    }
}
