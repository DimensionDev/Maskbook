import { useMemo } from 'react'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST, SocialAddressType } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { useTipsSetting } from '../../hooks/useTipsSetting.js'

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
    const { value: TipsSetting } = useTipsSetting(personaPubkey)
    const { value: socialAccounts = EMPTY_LIST } = useSocialAccountsAll(identity, supportSources)

    return useMemo(() => {
        if (!TipsSetting) return socialAccounts
        const { hiddenAddresses, defaultAddress } = TipsSetting
        const list = defaultAddress
            ? socialAccounts.sort((a) => (isSameAddress(a.address, defaultAddress) ? -1 : 1))
            : socialAccounts
        if (!hiddenAddresses?.length) return list
        return list.filter((x) => !hiddenAddresses.some((y) => isSameAddress(y, x.address)))
    }, [socialAccounts, TipsSetting])
}
