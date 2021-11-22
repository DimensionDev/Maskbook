import { useAsyncRetry } from 'react-use'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxStatus(id: string | number) {
    const maskBoxContract = useMaskBoxContract()
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return null
        return maskBoxContract.methods.getBoxStatus(id).call()
    }, [id, maskBoxContract])
}
