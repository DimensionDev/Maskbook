import type { NetworkPluginID } from '@masknet/shared-base'
import { SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'

export function sorter(a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>): number {
    if (a.type === SocialAddressType.NEXT_ID) return -1
    if (z.type === SocialAddressType.NEXT_ID) return 1
    return 0
}
