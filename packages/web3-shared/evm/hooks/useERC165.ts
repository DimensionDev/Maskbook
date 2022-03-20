import { useAsyncRetry } from 'react-use'
import { useERC165Contract } from '../contracts/useERC165Contract'

export const ERC165_INTERFACE_ID = '0x01ffc9a7'

export function useERC165(account: string, address: string, interfaceId: string) {
    const contract = useERC165Contract(address)
    return useAsyncRetry<boolean>(async () => {
        if (!contract) return false
        try {
            const isERC165 = await contract.methods.supportsInterface(ERC165_INTERFACE_ID).call({ from: account })
            const isVerify = await contract.methods.supportsInterface(interfaceId).call({ from: account })
            return isERC165 && isVerify
        } catch {
            return false
        }
    }, [account, address, interfaceId])
}
