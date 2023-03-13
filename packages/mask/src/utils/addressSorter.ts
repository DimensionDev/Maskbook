import type { Web3Helper } from '@masknet/web3-helpers'
import { type SocialAccount, SocialAddressType } from '@masknet/shared-base'

export function addressSorter(
    a: SocialAccount<Web3Helper.ChainIdAll>,
    z: SocialAccount<Web3Helper.ChainIdAll>,
): number {
    if (a.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return -1
    if (z.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return 1
    return 0
}
