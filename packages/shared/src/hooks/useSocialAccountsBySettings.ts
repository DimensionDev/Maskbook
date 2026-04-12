import { useCallback } from 'react'
import type { SocialAddressType, SocialAccount, SocialIdentity } from '@masknet/shared-base'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useSocialAccountsBySettings(
    identity: SocialIdentity | null | undefined,
    typeWhitelist: SocialAddressType[] | undefined,
    sorter: ((a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>) => number) | undefined,
) {
    const [
        socialAccounts,
        { isPending: loadingSocialAccounts, isLoading, error: loadSocialAccountsError, refetch: refetchSocialAccounts },
    ] = useSocialAccountsAll(identity, typeWhitelist, sorter)

    const refetch = useCallback(() => {
        refetchSocialAccounts()
    }, [])

    return {
        data: socialAccounts,
        isPending: loadingSocialAccounts,
        isLoading,
        error: loadSocialAccountsError,
        refetch,
    }
}
