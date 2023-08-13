import { type SocialAccount, type SocialAddressType, type SocialIdentity, EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useSocialAddressesAll } from './useSocialAddressesAll.js'
import { useSocialAccountsFrom } from './useSocialAccountsFrom.js'

/**
 * Get all social addresses across all networks.
 */
export function useSocialAccountsAll(
    identity?: SocialIdentity,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>) => number,
) {
    const { data: socialAddressList = EMPTY_LIST, ...rest } = useSocialAddressesAll(identity, includes, sorter)
    const socialAccounts = useSocialAccountsFrom(socialAddressList) ?? EMPTY_LIST

    return {
        ...rest,
        data: socialAccounts,
    }
}
