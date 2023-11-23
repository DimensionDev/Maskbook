import { EMPTY_LIST, type SocialAddress, type SocialAddressType, type SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { UseQueryResult } from '@tanstack/react-query'
import { useSocialAccountsFrom } from './useSocialAccountsFrom.js'
import { useSocialAddressesAll } from './useSocialAddressesAll.js'

type T = UseQueryResult

/**
 * Get all social addresses across all networks.
 */
export function useSocialAccountsAll(
    identity?: SocialIdentity | null,
    includes?: SocialAddressType[],
    sorter?: (a: SocialAddress<Web3Helper.ChainIdAll>, z: SocialAddress<Web3Helper.ChainIdAll>) => number,
) {
    const query = useSocialAddressesAll(identity, includes, sorter)
    const { data: socialAddressList = EMPTY_LIST } = query
    const socialAccounts = useSocialAccountsFrom(socialAddressList) ?? EMPTY_LIST

    return [socialAccounts, query] as const
}
