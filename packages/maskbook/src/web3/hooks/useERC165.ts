import { useAsyncRetry } from 'react-use'
import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { createContract } from './useContract'
import { useAccount } from './useAccount'
import { ERC165_INTERFACE_ID } from '../constants'
import type { AbiItem } from 'web3-utils'

export function useERC165(address: string, interfaceId: string) {
    return useSuspense<boolean, [string, string]>(address, [address, interfaceId], cache, Suspender)
}

async function Suspender(address: string, interfaceId: string): Promise<boolean> {
    const account = useAccount()

    return useAsyncRetry(async () => {
        const contract = createContract<Qualification>(account, address, QualificationABI as AbiItem[])
        if (!contract) return false
        try {
            const isERC165 = await contract.methods.supportsInterface(ERC165_INTERFACE_ID).call({ from: account })
            const isVerify = await contract.methods.supportsInterface(interfaceId).call({ from: account })
            return isERC165 && isVerify
        } catch (e) {
            return false
        }
    }, [account, address, interfaceId])
}
