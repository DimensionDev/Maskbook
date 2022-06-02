import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'
import { useMemo } from 'react'

export function useWallets<T extends NetworkPluginID>(pluginID?: T, storageRequired?: boolean) {
    const { Wallet } = useWeb3State(pluginID)
    const wallets = useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
    return useMemo(() => {
        return wallets.filter((x) => x.hasStoredKeyInfo || !storageRequired)
    }, [wallets, storageRequired])
}
