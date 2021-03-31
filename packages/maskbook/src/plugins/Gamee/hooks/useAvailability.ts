import { useAsyncRetry } from 'react-use'
import { useTokenContract } from '../contracts/useTokenContract'
import { resolveStateType } from '../pipes'
import type { US_STATE_TYPE } from '../types'

export function useAvailability(stateType: US_STATE_TYPE) {
    const tokenContract = useTokenContract()
    const { value, ...result } = useAsyncRetry(async () => {
        if (!tokenContract) return null
        return tokenContract.methods.check_availability(resolveStateType(stateType)).call()
    }, [stateType])
    return {
        value: Number.parseInt(value ?? '0', 10),
        ...result,
    }
}
