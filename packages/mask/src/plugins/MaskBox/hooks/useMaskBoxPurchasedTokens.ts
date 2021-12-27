import { useAsyncRetry } from 'react-use'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxPurchasedTokens(id: string | number, customer: string) {
    const maskBoxContract = useMaskBoxContract()
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return []
        return maskBoxContract.methods.getPurchasedNft(id, customer).call()
    }, [id, customer, maskBoxContract])
}
