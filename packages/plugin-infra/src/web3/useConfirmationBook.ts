import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { UNDEIFNED } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useConfirmationBook<T extends NetworkPluginID>(pluginID?: T) {
    const { RiskWarning } = useWeb3State(pluginID)
    return useSubscription(RiskWarning?.confirmationBook ?? UNDEIFNED)
}
