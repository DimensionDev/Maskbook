import { useMemo } from 'react'
import { compact, first, groupBy } from 'lodash-unified'
import type { NetworkPluginID } from '@masknet/shared-base'
import { SocialAccount, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'

/**
 * Get all social addresses under of all networks.
 */
export function useSocialAccounts(socialAddressList: Array<SocialAddress<NetworkPluginID>>) {
    return useMemo(() => {
        const accountsGrouped = groupBy(socialAddressList, (x) => `${x.pluginID}_${x.address.toLowerCase()}`)
        return Object.entries(accountsGrouped).map<SocialAccount>(([, group]) => {
            return {
                pluginID: group[0].pluginID,
                address: group[0].address,
                label:
                    first(group.find((x) => x.type === SocialAddressType.NEXT_ID)?.address) ??
                    first(
                        compact(
                            [SocialAddressType.ENS, SocialAddressType.RSS3, SocialAddressType.SOL].map(
                                (x) => group.find((y) => y.type === x)?.label,
                            ),
                        ),
                    ) ??
                    group[0].label,
                supportedAddressTypes: group.map((x) => x.type),
            }
        })
    }, [socialAddressList])
}
