import { useAsyncRetry } from 'react-use'
import type { AbiItem } from 'web3-utils'
import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useContract } from '../../../web3/hooks/useContract'

export function useQualification(qualification_address: string) {
    const account = useAccount()
    const qualificationContract = useContract<Qualification>(qualification_address, QualificationABI as AbiItem[])

    return useAsyncRetry(async () => {
        const startTime = await qualificationContract!.methods.get_start_time().call({ from: account })
        return Number(startTime) * 1000
    }, [account, qualificationContract])
}
