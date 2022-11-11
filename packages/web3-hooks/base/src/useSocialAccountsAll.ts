import { EMPTY_LIST } from '@masknet/shared-base'
import type { SocialAccount, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { useSocialAddressesAll } from './useSocialAddressesAll.js'
import { useSocialAccountsFrom } from './useSocialAccountsFrom.js'
import { useMemo } from 'react'

/**
 * Get all social addresses across all networks.
 */
export function useSocialAccountsAll(
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAccount, z: SocialAccount) => number,
) {
    const { value: socialAddressList = EMPTY_LIST, ...rest } = useSocialAddressesAll(identity, includes)
    const socialAccounts = useSocialAccountsFrom(socialAddressList) ?? EMPTY_LIST

    const sorted = useMemo(() => {
        return sorter ? socialAccounts.sort(sorter) : socialAccounts
    }, [socialAccounts, sorter])

    return {
        ...rest,
        value: sorted,
    }
}
