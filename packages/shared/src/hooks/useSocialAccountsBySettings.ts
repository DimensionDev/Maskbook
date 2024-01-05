import { useCallback, useMemo } from 'react'
import { PluginID, SocialAddressType, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { useHiddenAddressConfigOf, useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { currySameAddress } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { WalletAPI } from '@masknet/web3-providers/types'

export function useSocialAccountsBySettings(
    identity: SocialIdentity | null | undefined,
    typeWhitelist: SocialAddressType[] | undefined,
    sorter: ((a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>) => number) | undefined,
    signWithPersona: WalletAPI.SignWithPersona,
) {
    const [
        socialAccounts,
        { isPending: loadingSocialAccounts, error: loadSocialAccountsError, refetch: refetchSocialAccounts },
    ] = useSocialAccountsAll(identity, typeWhitelist, sorter)
    const userId = identity?.identifier?.userId
    const [
        hiddenAddress,
        {
            isFetching: loadingHiddenAddress,
            isLoading,
            error: loadingHiddenAddressError,
            refetch: refetchLoadHiddenAddress,
        },
    ] = useHiddenAddressConfigOf(identity?.publicKey, PluginID.Web3Profile, userId, signWithPersona)

    const addresses = useMemo(() => {
        if (!hiddenAddress || !socialAccounts) return socialAccounts

        return socialAccounts.filter((x) => {
            if (!x.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return true
            return !hiddenAddress.some(currySameAddress(x.address))
        })
    }, [socialAccounts, hiddenAddress, loadingHiddenAddress])

    const refetch = useCallback(() => {
        refetchSocialAccounts()
        refetchLoadHiddenAddress()
    }, [])

    return {
        data: addresses,
        isPending: loadingSocialAccounts || loadingHiddenAddress,
        isLoading,
        error: loadSocialAccountsError || loadingHiddenAddressError,
        refetch,
    }
}
