import { useAsyncRetry } from 'react-use'
import { useCOTM_TokenContract } from '../contracts/useCOTM_TokenContract'

export function useAvailability() {
    const electionTokenContract = useCOTM_TokenContract()
    const { value, ...result } = useAsyncRetry(async () => {
        if (!electionTokenContract) return null
        return electionTokenContract.methods.check_availability().call()
    }, [])
    return {
        value: Number.parseInt(value ?? '0', 10),
        ...result,
    }
}
