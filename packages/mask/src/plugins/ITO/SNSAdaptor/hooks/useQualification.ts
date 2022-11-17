import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useQualificationContract } from './useQualificationContract.js'

export function useQualification(qualification_address: string, ito_address: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { contract: qualificationContract } = useQualificationContract(chainId, qualification_address, ito_address)

    return useAsyncRetry(async () => {
        if (!qualificationContract) return null
        const startTime = await qualificationContract.methods.get_start_time().call({ from: account })
        return Number(startTime) * 1000
    }, [account, qualificationContract])
}
