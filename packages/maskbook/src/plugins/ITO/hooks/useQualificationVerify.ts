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

// Test ropsten contract address
// not qualification: 0xdd607c126a2ce3e78d3035b07674a6ab715cf77e
// qualification: 0x12d13b8a15368087c8c1fe9f9670c4c5c93387aa
// qualification with start time: 0x95828e478a27f5f9c714edceea8fec0bc8a1b5e3 timestamp: 1620565336 Sun May 09 2021 21:02:16 GMT+0800
