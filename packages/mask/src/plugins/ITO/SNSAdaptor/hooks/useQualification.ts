import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useQualificationContract } from './useQualificationContract.js'

export function useQualification(qualification_address: string, ito_address: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { contract: qualificationContract } = useQualificationContract(chainId, qualification_address, ito_address)

    return useAsyncRetry(async () => {
        const startTime = await qualificationContract!.methods.get_start_time().call({ from: account })
        return Number(startTime) * 1000
    }, [account, qualificationContract])
}
