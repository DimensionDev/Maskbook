import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useQualificationContract } from './useQualificationContract'

export function useQualification(qualification_address: string, ito_address: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { contract: qualificationContract } = useQualificationContract(chainId, qualification_address, ito_address)

    return useAsyncRetry(async () => {
        const startTime = await qualificationContract!.methods.get_start_time().call({ from: account })
        return Number(startTime) * 1000
    }, [account, qualificationContract])
}
