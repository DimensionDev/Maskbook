import { useAsyncRetry } from 'react-use'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import {
    QUALIFICATION_INTERFACE_ID,
    QUALIFICATION2_INTERFACE_ID,
    QUALIFICATION_HAS_START_TIME_INTERFACE_ID,
    QUALIFICATION_HAS_LUCKY_INTERFACE_ID,
} from '../../constants'
import { useAccount, useERC165 } from '@masknet/web3-shared-evm'
import { useQualificationContract } from './useQualificationContract'

export function useQualificationVerify(address: string, ito_address?: string) {
    const account = useAccount()
    const { contract: qualificationContract, version } = useQualificationContract(address, ito_address)
    const { value: isQualificationHasLucky, loading: loadingQualificationHasLucky } = useERC165<
        Qualification | Qualification2
    >(qualificationContract, address, QUALIFICATION_HAS_LUCKY_INTERFACE_ID)
    const { value: isQualification, loading: loadingQualification } = useERC165<Qualification | Qualification2>(
        qualificationContract,
        address,
        version === 1 ? QUALIFICATION_INTERFACE_ID : QUALIFICATION2_INTERFACE_ID,
    )

    const { value: qualificationHasStartTime, loading: loadingQualificationHasStartTime } = useERC165<
        Qualification | Qualification2
    >(qualificationContract, address, QUALIFICATION_HAS_START_TIME_INTERFACE_ID)

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
