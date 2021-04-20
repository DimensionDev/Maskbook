import { useAsyncRetry } from 'react-use'
import { useERC165 } from '../../../web3/hooks/useERC165'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { createContract } from '../../../web3/hooks/useContract'
import type { AbiItem } from 'web3-utils'

import { QUALIFICATION_INTERFACE_ID, QUALIFICATION_HAS_START_TIME_INTERFACE_ID } from '../constants'

export function useQualificationVerify(address: string) {
    const account = useAccount()
    const contract = createContract<Qualification>(account, address, QualificationABI as AbiItem[])

    const { value: isQualification, loading: loadingQualification } = useERC165<Qualification>(
        contract,
        address,
        QUALIFICATION_INTERFACE_ID,
    )

    const { value: qualificationHasStartTime, loading: loadingQualificationHasStartTime } = useERC165<Qualification>(
        contract,
        address,
        QUALIFICATION_HAS_START_TIME_INTERFACE_ID,
    )

    return useAsyncRetry(async () => {
        let startTime
        if (qualificationHasStartTime) {
            startTime = await contract!.methods.get_start_time().call({ from: account })
        }

        return {
            loadingERC165: loadingQualification || loadingQualificationHasStartTime,
            isQualification,
            startTime,
        }
    }, [address, isQualification, qualificationHasStartTime, loadingQualification, loadingQualificationHasStartTime])
}
