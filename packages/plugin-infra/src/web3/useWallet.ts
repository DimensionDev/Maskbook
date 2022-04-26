import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { EMPTY_ARRAY } from '../utils/subscription'
import { useAccount } from './useAccount'
import { useWeb3State } from './useWeb3State'

export function useWallet<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const { Others, Wallet } = useWeb3State(pluginID)
    const wallets = useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
    return account ? wallets.find((x) => Others?.isSameAddress?.(x.address, account)) ?? null : null
}
