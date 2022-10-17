import type { IdentityResolved } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useMemo } from 'react'
import { usePublicWallets } from '../../hooks/usePublicWallets.js'
import { useTipsSetting } from '../../hooks/useTipsSetting.js'

export function useTipsAccounts(identity: IdentityResolved | undefined, personaPubkey: string | undefined) {
    const { value: TipsSetting } = useTipsSetting(personaPubkey)
    const { value: socialAccounts = EMPTY_LIST } = useSocialAccountsAll(identity)
    const publicWallets = usePublicWallets(identity)
    return useMemo(() => {
        const list = uniqBy([...socialAccounts, ...publicWallets], (x) => x.address.toLowerCase())
        return list.filter((x) => !TipsSetting?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)))
    }, [socialAccounts, publicWallets, TipsSetting?.hiddenAddresses])
}
