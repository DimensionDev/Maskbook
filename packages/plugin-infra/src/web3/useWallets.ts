import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useWallets<T extends NetworkPluginID>(pluginID?: T) {
    const { Wallet } = useWeb3State(pluginID)
    return useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
}
