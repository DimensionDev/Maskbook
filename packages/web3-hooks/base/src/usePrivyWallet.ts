import { isSameAddress } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { useFireflyEmbeddedWallets } from './useFireflyEmbeddedWallets.js'

/**
 * Returns the Firefly embedded wallet for `address`, or `null`.
 *
 * The historical name is retained so call sites are unchanged after the Privy
 * removal; internally it now resolves from {@link useFireflyEmbeddedWallets}.
 */
export function usePrivyWallet(address: string | undefined) {
    const { wallets, ready } = useFireflyEmbeddedWallets()

    return useMemo(
        () => (ready && address ? (wallets.find((x) => isSameAddress(x.address, address)) ?? null) : null),
        [wallets, ready, address],
    )
}
