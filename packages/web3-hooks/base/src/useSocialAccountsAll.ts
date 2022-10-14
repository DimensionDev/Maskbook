import { useMemo } from 'react'
import { groupBy } from 'lodash-unified'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { SocialAccount, SocialAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { useSocialAddressListAll } from './useSocialAddressListAll.js'

/**
 * Get all social addresses under of all networks.
 */
export function useSocialAccountsAll(
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>) => number,
) {
    const { value: socialAddressList = EMPTY_LIST, ...rest} = useSocialAddressListAll(identity, includes, sorter)
    const socialAccounts = useMemo(() => {
        const accountsGrouped = groupBy(socialAddressList,
            (x) => `${x.pluginID}_${x.address.toLowerCase()}`,
        )
        return Object.entries(accountsGrouped).map<SocialAccount>(([, group]) => {
            return {
                pluginID: group[0].pluginID,
                address: group[0].address,
                label: group[0].label,
                supportedAddressTypes: group.map(x => x.type)
            }
        })
    }, [socialAddressList])

    return {
        ...rest,
        value: socialAccounts,
    }
}
