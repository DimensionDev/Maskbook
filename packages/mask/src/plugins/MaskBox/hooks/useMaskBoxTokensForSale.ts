import { useAsyncRetry } from 'react-use'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxTokensForSale(id: string | number) {
    const maskBoxContract = useMaskBoxContract()
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return []
        return maskBoxContract.methods.getNftListForSale(id, 0, 100).call()
    }, [id, maskBoxContract])
}
