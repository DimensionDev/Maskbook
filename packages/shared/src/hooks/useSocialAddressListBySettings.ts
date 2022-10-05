import { useEffect, useMemo } from 'react'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { useHiddenAddressSetting, useSocialAddressListAll } from '@masknet/web3-hooks-base'
import { PluginID } from '@masknet/shared-base'
import {
    currySameAddress,
    NetworkPluginID,
    SocialAddress,
    SocialAddressType,
    SocialIdentity,
} from '@masknet/web3-shared-base'

export const useSocialAddressListBySettings = (
    identity?: SocialIdentity,
    typeWhitelist?: SocialAddressType[],
    sorter?: (a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>) => number,
) => {
    const {
        value: socialAddressList = EMPTY_LIST,
        loading: loadingSocialAddressList,
        error: loadSocialAddressListError,
        retry: retrySocialAddress,
    } = useSocialAddressListAll(identity, typeWhitelist, sorter)

    const {
        value: hiddenAddress,
        loading: loadingHiddenAddress,
        error: loadingHiddenAddressError,
        retry: retryLoadHiddenAddress,
    } = useHiddenAddressSetting(PluginID.Web3Profile, identity?.publicKey)

    const addresses = useMemo(() => {
        if (loadingSocialAddressList || loadingHiddenAddress) return EMPTY_LIST
        if (!hiddenAddress || !hiddenAddress.length) return socialAddressList

        return socialAddressList.filter((x) => {
            if (x.type !== SocialAddressType.NEXT_ID) return true
            return !hiddenAddress.some(currySameAddress(x.address))
        })
    }, [socialAddressList, hiddenAddress, loadingSocialAddressList, loadingHiddenAddress])

    useEffect(() => {
        return CrossIsolationMessages.events.walletSettingsDialogEvent.on(({ pluginID }) => {
            if (pluginID === PluginID.Web3Profile) retryLoadHiddenAddress()
        })
    }, [retryLoadHiddenAddress])

    return {
        value: addresses,
        loading: loadingSocialAddressList || loadingHiddenAddress,
        error: loadSocialAddressListError || loadingHiddenAddressError,
        retry: retrySocialAddress || retryLoadHiddenAddress,
    }
}
