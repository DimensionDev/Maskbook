import { useAsyncRetry } from 'react-use'
import { useCOTM_TokenContract } from '../contracts/useCOTM_TokenContract'

export function useAvailability() {
    const COTM_TokenContract = useCOTM_TokenContract()
    const { value, ...result } = useAsyncRetry(async () => {
        if (!COTM_TokenContract) return null
        return COTM_TokenContract.methods.check_availability().call()
    }, [])
    return {
        value: Number.parseInt(value ?? '0', 10),
        ...result,
    }
}
