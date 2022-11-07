import { SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'

export function sorter(a: SocialAccount, z: SocialAccount): number {
    if (a.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return -1
    if (z.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)) return 1
    return 0
}
