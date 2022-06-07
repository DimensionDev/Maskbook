import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'
import { useDefaultNetworkType } from './useDefaultNetworkType'
import { useCurrentWeb3NetworkNetworkType } from './Context'

export function useNetworkType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    type Result = S extends 'all' ? Web3Helper.NetworkTypeAll : Web3Helper.Definition[T]['NetworkType']

    const { Provider } = useWeb3State(pluginID)
    const currentNetworkType = useCurrentWeb3NetworkNetworkType(pluginID)
    const defaultNetworkType = useDefaultNetworkType(pluginID) as Web3Helper.Definition[T]['NetworkType']
    const networkType = useSubscription(
        (Provider?.networkType ?? UNDEFINED) as Subscription<Web3Helper.Definition[T]['NetworkType'] | undefined>,
    )

    return (currentNetworkType ?? networkType ?? defaultNetworkType) as Result
}
