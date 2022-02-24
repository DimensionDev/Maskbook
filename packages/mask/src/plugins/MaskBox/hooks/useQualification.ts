import { useAsyncRetry } from 'react-use'
import { useMaskBoxQualificationContract } from './useMaskBoxQualificationContract'

export function useQualification(address?: string, account?: string, proof?: string) {
    const qualificationContract = useMaskBoxQualificationContract(address)
    const { value: qualification = { qualified: false, error_msg: '' } } = useAsyncRetry(async () => {
        if (!qualificationContract || !account) return null
        return qualificationContract.methods.is_qualified(account, proof ?? '0x00').call({
            from: account,
        })
    }, [account, qualificationContract, proof])
    return qualification
}
