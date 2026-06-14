import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount } from '@masknet/shared-base'

export function addressSorter(
    _a: SocialAccount<Web3Helper.ChainIdAll>,
    _z: SocialAccount<Web3Helper.ChainIdAll>,
): number {
    return 0
}
