import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useSubscription } from 'use-subscription'
import { FALSE } from '../utils/subscription'
import { useWeb3State } from './useWeb3State'

export function useRiskWarningApproved<T extends NetworkPluginID>(pluginID?: T) {
    const { RiskWarning } = useWeb3State(pluginID)
    return useSubscription(RiskWarning?.approved ?? FALSE)
}
