import { useAsyncRetry } from 'react-use'
import type { Contract } from 'web3-eth-contract'
import { useAccount } from './useAccount'
import { ERC165_INTERFACE_ID } from '../constants'

export function useERC165<T extends Contract>(contract: T | null, address: string, interfaceId: string) {
    const account = useAccount()

    return useAsyncRetry<boolean>(async () => {
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
