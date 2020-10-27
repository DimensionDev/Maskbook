import { useAsyncRetry } from 'react-use'
import { useElectionTokenContract } from '../contracts/useElectionTokenContract'
import { resolveStateType } from '../pipes'
import type { US_STATE_TYPE } from '../types'

export function useAvailability(stateType: US_STATE_TYPE) {
    const electionTokenContract = useElectionTokenContract()
    const { value, ...rest } = useAsyncRetry(async () => {
        if (!electionTokenContract) return null
        return electionTokenContract.methods.check_availability(resolveStateType(stateType)).call()
    }, [stateType])
    return {
        value: parseInt(value ?? '0', 10),
        ...rest,
    }
}
