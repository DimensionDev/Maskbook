import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { SocialAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { useSocialAddresses } from './useSocialAddresses.js'
import { useSocialAccountsFrom } from './useSocialAccountsFrom.js'

/**
 * Get all social addresses under the given network.
 */
export function useSocialAccounts<T extends NetworkPluginID>(
    pluginID?: T,
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: <V = T>(a: SocialAddress<V>, z: SocialAddress<V>) => number,
) {
    const { value: socialAddressList = EMPTY_LIST, ...rest } = useSocialAddresses(pluginID, identity, includes, sorter)
    const socialAccounts = useSocialAccountsFrom(socialAddressList)

    return {
        ...rest,
        value: socialAccounts,
    }
}
