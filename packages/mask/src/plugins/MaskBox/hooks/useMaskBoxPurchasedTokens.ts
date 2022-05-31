import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxPurchasedTokens(id: string | number, customer: string) {
    const maskBoxContract = useMaskBoxContract()
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return EMPTY_LIST
        return maskBoxContract.methods.getPurchasedNft(id, customer).call()
    }, [id, customer, maskBoxContract])
}
