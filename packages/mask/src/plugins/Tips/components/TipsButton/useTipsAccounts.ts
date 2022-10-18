import { useMemo } from 'react'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { useTipsSetting } from '../../hooks/useTipsSetting.js'

export function useTipsAccounts(identity: IdentityResolved | undefined, personaPubkey: string | undefined) {
    const { value: TipsSetting } = useTipsSetting(personaPubkey)
    const { value: socialAccounts = EMPTY_LIST } = useSocialAccountsAll(identity)
    return useMemo(() => {
        return socialAccounts.filter((x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)))
    }, [socialAccounts, TipsSetting?.hiddenAddresses])
}
