import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-shared-evm'
import { useQualificationContract } from './useQualificationContract'

export function useQualification(qualification_address: string, ito_address: string) {
    const account = useAccount()
    const { contract: qualificationContract } = useQualificationContract(qualification_address, ito_address)

    return useAsyncRetry(async () => {
        const startTime = await qualificationContract!.methods.get_start_time().call({ from: account })
        return Number(startTime) * 1000
    }, [account, qualificationContract])
}
