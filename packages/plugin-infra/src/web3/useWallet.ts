import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'
import { useAccount } from './useAccount'
import { useWeb3State } from './useWeb3State'

export function useWallet<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const { Utils, Wallet } = useWeb3State(pluginID)
    const wallets = useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)

    if (!account) return
    return wallets.find((x) => Utils?.isSameAddress?.(x.address, account))
}
