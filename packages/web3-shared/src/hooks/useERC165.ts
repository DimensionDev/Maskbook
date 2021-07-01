import { useAsyncRetry } from 'react-use'
import type { BaseContract } from '@masknet/contracts/types/types'
import { useAccount } from './useAccount'

export const ERC165_INTERFACE_ID = '0x01ffc9a7'

export function useERC165<T extends BaseContract>(contract: T | null, address: string, interfaceId: string) {
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
