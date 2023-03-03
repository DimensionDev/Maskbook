import { useEffect, useMemo } from 'react'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { useHiddenAddressSettings, useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { currySameAddress, PluginID, SocialAccount, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
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

    if (process.env.NODE_ENV === 'development') {
        console.assert(identity?.publicKey, 'To get hidden address settings, identity.publicKey required')
    }
    const {
        value: hiddenAddress,
        loading: loadingHiddenAddress,
        error: loadingHiddenAddressError,
        retry: retryLoadHiddenAddress,
    } = useHiddenAddressSettings(PluginID.Web3Profile, identity?.publicKey)

    const addresses = useMemo(() => {
        if (loadingSocialAccounts || loadingHiddenAddress) return EMPTY_LIST
        if (!hiddenAddress?.length) return socialAccounts

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
