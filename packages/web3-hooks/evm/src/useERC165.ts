import { useAsyncRetry } from 'react-use'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'

export const ERC165_INTERFACE_ID = '0x01ffc9a7'

export function useERC165<T extends BaseContract>(contract: T | null, address?: string, interfaceId?: string) {
    return useAsyncRetry<boolean>(async () => {
        if (!contract || !address || !interfaceId) return false
        try {
            const isERC165 = await contract.methods.supportsInterface(ERC165_INTERFACE_ID).call()
            const verified = await contract.methods.supportsInterface(interfaceId).call()
            return isERC165 && verified
        } catch {
            return false
        }
    }, [address, interfaceId])
}
