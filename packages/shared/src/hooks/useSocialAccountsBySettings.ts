import { useCallback, useMemo } from 'react'
import { PluginID, EMPTY_LIST, SocialAddressType, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { useHiddenAddressConfigOf, useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { currySameAddress } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export const useSocialAccountsBySettings = (
    identity?: SocialIdentity,
    typeWhitelist?: SocialAddressType[],
    sorter?: (a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>) => number,
) => {
    const {
        value: socialAccounts = EMPTY_LIST,
        loading: loadingSocialAccounts,
        error: loadSocialAccountsError,
        retry: retrySocialAccounts,
    } = useSocialAccountsAll(identity, typeWhitelist, sorter)
    const userId = identity?.identifier?.userId
    const {
        data: hiddenAddress,
        isFetching: loadingHiddenAddress,
        isInitialLoading,
        error: loadingHiddenAddressError,
        refetch: retryLoadHiddenAddress,
    } = useHiddenAddressConfigOf(PluginID.Web3Profile, identity?.publicKey, userId)

    const addresses = useMemo(() => {
        if (!hiddenAddress?.length) return socialAccounts

        return socialAccounts.filter((x) => {
            if (!x.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return true
            return !hiddenAddress.some(currySameAddress(x.address))
        })
    }, [socialAccounts, hiddenAddress, loadingHiddenAddress])

    const retry = useCallback(() => {
        retrySocialAccounts()
        retryLoadHiddenAddress()
    }, [])

    return {
        value: addresses,
        loading: loadingSocialAccounts || loadingHiddenAddress,
        isInitialLoading,
        error: loadSocialAccountsError || loadingHiddenAddressError,
        retry,
    }
}
