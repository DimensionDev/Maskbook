import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State.js'
import { NULL } from '../utils/subscription.js'

export function useWalletPrimary<T extends NetworkPluginID>(pluginID?: T) {
    const { Wallet } = useWeb3State(pluginID)
    return useSubscription(Wallet?.walletPrimary ?? NULL)
}
