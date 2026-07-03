import { EMPTY_LIST, getFireflyAccessToken, PersistentStorages } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import {
    createFireflyEmbeddedWallet,
    type FireflyEmbeddedWallet,
    FireflyEmbeddedWalletClient,
} from '@masknet/web3-providers'
import { useSubscription } from 'use-subscription'

/** Query key for the embedded-wallets list. Invalidate after creating a wallet. */
export const FIREFLY_EMBEDDED_WALLETS_QUERY_KEY = ['firefly', 'embedded-wallets'] as const

/**
 * Discovers Firefly embedded wallets for the signed-in Firefly account.
 * Replaces `useWallets()` from `@privy-io/react-auth`. The result is shared
 * (de-duplicated) across consumers via React Query and re-fetches whenever the
 * Firefly access token changes.
 */
export function useFireflyEmbeddedWallets(): { wallets: FireflyEmbeddedWallet[]; ready: boolean } {
    const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)
    const accessToken = getFireflyAccessToken(fireflyAccount)

    const { data, isLoading } = useQuery({
        queryKey: [...FIREFLY_EMBEDDED_WALLETS_QUERY_KEY, accessToken] as const,
        queryFn: async (): Promise<FireflyEmbeddedWallet[]> => {
            if (!accessToken) return EMPTY_LIST
            try {
                const accounts = await FireflyEmbeddedWalletClient.getEmbeddedWallets()
                return accounts.map((account) => createFireflyEmbeddedWallet(account.address))
            } catch {
                return EMPTY_LIST
            }
        },
        staleTime: 0,
        retry: 1,
    })

    return { wallets: data ?? EMPTY_LIST, ready: !isLoading }
}
