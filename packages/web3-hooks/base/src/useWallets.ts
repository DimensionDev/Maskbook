import { EMPTY_ARRAY, NetworkPluginID } from '@masknet/shared-base'
import { useAsync } from 'react-use'
import { useSubscription } from 'use-subscription'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useWeb3State } from './useWeb3State.js'

export function useWallets<T extends NetworkPluginID>(pluginID?: T) {
    const { Wallet } = useWeb3State(pluginID)
    // const connection = useWeb3Connection(pluginID)
    // const { Wallet } = useWeb3State(pluginID)
    // const wallets = useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
    // return useAsync(async () => {
    //     return connection?.getWallets?.() ?? wallets
    // }, [wallets, connection])
}
