import { useEffect, useMemo } from 'react'
import { PluginID, CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { useHiddenAddressSetting, useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { currySameAddress, SocialAccount, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'

export const useSocialAccountsBySettings = (
    identity?: SocialIdentity,
    typeWhitelist?: SocialAddressType[],
    sorter?: (a: SocialAccount, z: SocialAccount) => number,
) => {
    const {
        value: socialAccounts = EMPTY_LIST,
        loading: loadingSocialAccounts,
        error: loadSocialAccountsError,
        retry: retrySocialAccounts,
    } = useSocialAccountsAll(identity, typeWhitelist, sorter)

    const {
        value: hiddenAddress,
        loading: loadingHiddenAddress,
        error: loadingHiddenAddressError,
        retry: retryLoadHiddenAddress,
    } = useHiddenAddressSetting(PluginID.Web3Profile, identity?.publicKey)

    const addresses = useMemo(() => {
        if (loadingSocialAccounts || loadingHiddenAddress) return EMPTY_LIST
        if (!hiddenAddress || !hiddenAddress.length) return socialAccounts

        return socialAccounts.filter((x) => {
            if (!x.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return true
            return !hiddenAddress.some(currySameAddress(x.address))
        })
    }, [socialAccounts, hiddenAddress, loadingSocialAccounts, loadingHiddenAddress])

    useEffect(() => {
        return CrossIsolationMessages.events.walletSettingsDialogEvent.on(({ pluginID }) => {
            if (pluginID === PluginID.Web3Profile) retryLoadHiddenAddress()
        })
    }, [retryLoadHiddenAddress])

    return {
        value: addresses,
        loading: loadingSocialAccounts || loadingHiddenAddress,
        error: loadSocialAccountsError || loadingHiddenAddressError,
        retry: retrySocialAccounts || retryLoadHiddenAddress,
    }
}
