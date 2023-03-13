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
export function useTipsAccounts(identity: IdentityResolved | undefined, personaPubkey: string | undefined) {
    const { value: TipsSetting } = useTipsSetting(personaPubkey)
    const { value: socialAccounts = EMPTY_LIST } = useSocialAccountsAll(identity, supportSources)

    const hiddenAddresses = TipsSetting?.hiddenAddresses
    return useMemo(() => {
        if (!hiddenAddresses?.length) return socialAccounts
        return socialAccounts.filter((x) => !hiddenAddresses.some((y) => isSameAddress(y, x.address)))
    }, [socialAccounts, hiddenAddresses])
}
