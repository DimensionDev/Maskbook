import { useMemo } from 'react'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST, PluginID, SocialAddressType } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useHiddenAddressConfigOf, useSocialAccountsAll } from '@masknet/web3-hooks-base'

// In Tips, we don't list address from MaskX.
const supportSources: SocialAddressType[] = [
    SocialAddressType.Address,
    SocialAddressType.ENS,
    SocialAddressType.SPACE_ID,
    SocialAddressType.NEXT_ID,
    SocialAddressType.TwitterBlue,
    SocialAddressType.SOL,
]

/**
 * Get Tips accounts, removing the hidden ones,
 * and put the default one at the front.
 */
export function useTipsAccounts(identity: IdentityResolved | undefined, personaPubkey: string | undefined) {
    const { value: socialAccounts = EMPTY_LIST } = useSocialAccountsAll(identity, supportSources)
    const userId = identity?.identifier?.userId
    const { data: hiddenAddresses } = useHiddenAddressConfigOf(PluginID.Web3Profile, personaPubkey, userId)
    return useMemo(() => {
        if (!hiddenAddresses?.length) return socialAccounts
        const list = socialAccounts
        return list.filter((x) => !hiddenAddresses.some((y) => isSameAddress(y, x.address)))
    }, [hiddenAddresses, socialAccounts, userId])
}
