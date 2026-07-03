import { CrossIsolationMessages, EMPTY_LIST, PrivyEnvGuard } from '@masknet/shared-base'
import { usePersistSubscription } from '@masknet/shared-base-ui'
import { useAccount, useChainContext, useFireflyEmbeddedWallets } from '@masknet/web3-hooks-base'
import { EVMWeb3, MaskWalletProvider } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { memo } from 'react'
import { useAsync } from 'react-use'

/**
 * Syncs Firefly embedded wallets into the Mask wallet list. Replaces the former
 * Privy setup (no more JWT sync to Privy — auth is now a single Firefly token).
 */
export const PrivySetup = memo(
    PrivyEnvGuard(function PrivySetup() {
        const { wallets, ready } = useFireflyEmbeddedWallets()
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

        return null
    }),
)
