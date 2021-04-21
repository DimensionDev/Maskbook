import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { createContract } from '../../../web3/hooks/useContract'
import type { AbiItem } from 'web3-utils'

export function useQualification(qualification_address: string) {
    const account = useAccount()
    const contract = createContract<Qualification>(account, qualification_address, QualificationABI as AbiItem[])

    return useAsyncRetry(async () => {
        const startTime = await contract!.methods.get_start_time().call({ from: account })
        return Number(startTime) * 1000
    }, [account])
}
