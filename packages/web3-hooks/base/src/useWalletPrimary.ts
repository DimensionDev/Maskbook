import { useSubscription } from 'use-subscription'
import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { NULL } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useWalletPrimary<T extends NetworkPluginID>(pluginID?: T) {
    const { Wallet } = useWeb3State(pluginID)
    return useSubscription(Wallet?.walletPrimary ?? NULL)
}
