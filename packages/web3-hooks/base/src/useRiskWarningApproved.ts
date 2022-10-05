import { useSubscription } from 'use-subscription'
import { FALSE } from '@masknet/shared-base'

import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useRiskWarningApproved<T extends NetworkPluginID>(pluginID?: T) {
    const { RiskWarning } = useWeb3State(pluginID)
    return useSubscription(RiskWarning?.approved ?? FALSE)
}
