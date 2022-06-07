import { useAsyncRetry } from 'react-use'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import { useQualificationContract } from './useQualificationContract'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useIfQualified(address: string, ito_address: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { contract: qualificationContract, version } = useQualificationContract(chainId, address, ito_address)

    return useAsyncRetry(async () => {
        if (!qualificationContract) return false
        return (
            version === 1
                ? (qualificationContract as Qualification).methods.ifQualified(account)
                : (qualificationContract as Qualification2).methods.ifQualified(account, [])
        ).call({
            from: account,
        })
    }, [account, qualificationContract, chainId])
}
