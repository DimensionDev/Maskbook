import { useAccount, useChainContext, useFireflyEmbeddedWallets } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { memo } from 'react'
import { useAsync } from 'react-use'

/**
 * Once a Firefly embedded wallet is discovered for the signed-in Firefly
 * account, connects it as the active provider (auto-selecting the primary
 * wallet) — but only if nothing else is already connected, so it never
 * overrides an explicitly-connected external wallet.
 */
export const PrivySetup = memo(function PrivySetup() {
    const { wallets, ready } = useFireflyEmbeddedWallets()
    const account = useAccount()
    const { providerType } = useChainContext()

    useAsync(async () => {
        if (!ready || !wallets.length) return
        if (providerType !== ProviderType.None && providerType !== ProviderType.Firefly) return
        if (providerType === ProviderType.Firefly && account) return

        await EVMWeb3.connect({
            account: wallets[0].address,
            providerType: ProviderType.Firefly,
            silent: true,
        })
    }, [ready, wallets, providerType, account])

    return null
})
