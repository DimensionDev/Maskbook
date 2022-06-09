import { useAsyncRetry } from 'react-use'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxInfo(id: string | number) {
    const maskBoxContract = useMaskBoxContract()
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return null
        const info = await maskBoxContract.methods.getBoxInfo(id).call()
        return info
    }, [id, maskBoxContract])
}
