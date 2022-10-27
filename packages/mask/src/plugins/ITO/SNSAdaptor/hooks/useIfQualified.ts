import { useAsyncRetry } from 'react-use'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import { useQualificationContract } from './useQualificationContract.js'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'

export function useIfQualified(address: string, ito_address: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Others } = useWeb3State()
    const { contract: qualificationContract, version } = useQualificationContract(chainId, address, ito_address)

    return useAsyncRetry(async () => {
        if (!qualificationContract || !Others?.chainResolver.isValid(chainId)) return false
        return (
            version === 1
                ? (qualificationContract as Qualification).methods.ifQualified(account)
                : (qualificationContract as Qualification2).methods.ifQualified(account, [])
        ).call({
            from: account,
        })
    }, [account, qualificationContract, chainId])
}
