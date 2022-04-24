import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { EMPTY_ARRAY } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useWallets<T extends NetworkPluginID>(pluginID?: T) {
    const { Wallet } = useWeb3State(pluginID)
    return useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
}
