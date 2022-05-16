import { useAsyncRetry } from 'react-use'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import {
    QUALIFICATION_INTERFACE_ID,
    QUALIFICATION2_INTERFACE_ID,
    QUALIFICATION_HAS_START_TIME_INTERFACE_ID,
    QUALIFICATION_HAS_LUCKY_INTERFACE_ID,
} from '../../constants'
import { useQualificationContract } from './useQualificationContract'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useERC165 } from '@masknet/plugin-infra/web3-evm'

export function useQualificationVerify(address?: string, ito_address?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { contract: qualificationContract, version } = useQualificationContract(chainId, address, ito_address)
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
