import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { SocialAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { useSocialAddressListAll } from './useSocialAddressListAll.js'
import { useSocialAccountsFrom } from './useSocialAccountsFrom.js'

/**
 * Get all social addresses under of all networks.
 */
export function useSocialAccountsAll(
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>) => number,
) {
    const { value: socialAddressList = EMPTY_LIST, ...rest } = useSocialAddressListAll(identity, includes, sorter)
    const socialAccounts = useSocialAccountsFrom(socialAddressList)

    return {
        ...rest,
        value: socialAccounts,
    }
}
