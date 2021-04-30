import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useQualificationContract } from '../contracts/useQualificationContract'

export function useIfQualified(address: string) {
    const account = useAccount()
    const qualificationContract = useQualificationContract(address)

    return useAsyncRetry(async () => {
        if (!qualificationContract) return false
        return qualificationContract.methods.ifQualified(account).call({
            from: account,
        })
    }, [account, qualificationContract])
}
