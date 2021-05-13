import { useAsyncRetry } from 'react-use'
import type { AbiItem } from 'web3-utils'
import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { useERC165 } from '../../../web3/hooks/useERC165'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useContract } from '../../../web3/hooks/useContract'

import {
    QUALIFICATION_INTERFACE_ID,
    QUALIFICATION_HAS_START_TIME_INTERFACE_ID,
    QUALIFICATION_HAS_LUCKY_INTERFACE_ID,
} from '../constants'

export function useQualificationVerify(address: string) {
    const account = useAccount()
    const qualificationContract = useContract<Qualification>(address, QualificationABI as AbiItem[])
    const { value: isQualificationHasLucky, loading: loadingQualificationHasLucky } = useERC165<Qualification>(
        qualificationContract,
        address,
        QUALIFICATION_HAS_LUCKY_INTERFACE_ID,
    )
    const { value: isQualification, loading: loadingQualification } = useERC165<Qualification>(
        qualificationContract,
        address,
        QUALIFICATION_INTERFACE_ID,
    )

    const { value: qualificationHasStartTime, loading: loadingQualificationHasStartTime } = useERC165<Qualification>(
        qualificationContract,
        address,
        QUALIFICATION_HAS_START_TIME_INTERFACE_ID,
    )

    return useAsyncRetry(async () => {
        let startTime
        if (qualificationHasStartTime) {
            startTime = await qualificationContract!.methods.get_start_time().call({ from: account })
        }

        return {
            loadingERC165: loadingQualification || loadingQualificationHasStartTime || loadingQualificationHasLucky,
            isQualification,
            startTime,
            isQualificationHasLucky,
        }
    }, [
        address,
        isQualification,
        qualificationHasStartTime,
        isQualificationHasLucky,
        loadingQualification,
        loadingQualificationHasStartTime,
        loadingQualificationHasLucky,
        qualificationContract,
    ])
}
