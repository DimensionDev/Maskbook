import { useAsyncRetry } from 'react-use'
import { useMulticallContract } from '../contracts/useMulticallContract'

export function useCurrentBlockTimestamp() {
    const multicallContract = useMulticallContract()
    return useAsyncRetry(async () => multicallContract?.methods.getCurrentBlockTimestamp().call(), [multicallContract])
}
