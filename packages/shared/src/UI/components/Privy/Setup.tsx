import { CrossIsolationMessages, EMPTY_LIST, PersistentStorages } from '@masknet/shared-base'
import { usePersistSubscription } from '@masknet/shared-base-ui'
import { useAccount, useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3, MaskWalletProvider } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useWallets as usePrivyWallets, useSyncJwtBasedAuthState } from '@privy-io/react-auth'
import { memo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { useSubscription } from 'use-subscription'

export const PrivySetup = memo(function PrivySetup() {
    const getExternalJwt = useCallback(async () => {
        const firefly_account = PersistentStorages.Settings.storage.firefly_account.value
        return firefly_account.accessToken
    }, [])

    const firefly_account = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

    const subscribe = useCallback((onJwtAuthStateChange: () => void) => {
        return PersistentStorages.Settings.storage.firefly_account.subscription.subscribe(() => {
            onJwtAuthStateChange()
        })
    }, [])

    const { wallets, ready } = usePrivyWallets()
    const account = useAccount()

    const existedWallets = usePersistSubscription(
        '@@mask-wallets',
        MaskWalletProvider.subscription.wallets ?? EMPTY_LIST,
    )
    const { providerType } = useChainContext()
    useAsync(async () => {
        const newWallets = wallets.filter((x) => !existedWallets.find((y) => isSameAddress(y.address, x.address)))
        if (!newWallets.length) return
        CrossIsolationMessages.events.walletsUpdated.sendToAll()
        if (providerType !== ProviderType.MaskWallet) return
        if (!existedWallets || !account) {
            await EVMWeb3.connect({
                account: newWallets[0].address,
                providerType: ProviderType.MaskWallet,
                silent: true,
            })
        }
    }, [ready, wallets])

    useSyncJwtBasedAuthState({
        getExternalJwt,
        subscribe,
        enabled: !!firefly_account.accessToken,
    })

    return null
})
