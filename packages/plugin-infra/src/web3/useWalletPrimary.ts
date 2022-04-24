import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { NULL } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useWalletPrimary<T extends NetworkPluginID>(pluginID?: T) {
    const { Wallet } = useWeb3State(pluginID)
    return useSubscription(Wallet?.walletPrimary ?? NULL)
}
