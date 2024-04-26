import { type SocialAccount, type SocialAddressType, type SocialIdentity, EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useSocialAddressesAll } from './useSocialAddressesAll.js'
import { useSocialAccountsFrom } from './useSocialAccountsFrom.js'

/**
 * Get all social addresses across all networks.
 */
export function useSocialAccountsAll(
    identity?: SocialIdentity | null,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>) => number,
) {
    const query = useSocialAddressesAll(identity, includes, sorter)
    const socialAccounts = useSocialAccountsFrom(query.data || EMPTY_LIST) ?? EMPTY_LIST

    return [socialAccounts, query] as const
}
