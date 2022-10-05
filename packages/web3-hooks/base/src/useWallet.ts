import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EMPTY_ARRAY, NetworkPluginID } from '@masknet/shared-base'
import { useAccount } from './useAccount.js'
import { useWeb3State } from './useWeb3State.js'

export function useWallet<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const { Wallet } = useWeb3State(pluginID)
    const wallets = useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
    return useMemo(() => {
        return account ? wallets.find((x) => isSameAddress?.(x.address, account)) ?? null : null
    }, [account, wallets?.map((x) => x.address.toLowerCase()).join()])
}
