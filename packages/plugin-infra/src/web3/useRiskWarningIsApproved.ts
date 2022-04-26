import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { useWeb3State } from './useWeb3State'

export function useRiskWarningIsApproved<T extends NetworkPluginID>(pluginID?: T, address?: string) {
    const { RiskWarning } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!address || !RiskWarning?.isApproved) return false
        return RiskWarning.isApproved(address)
    }, [address])
}
