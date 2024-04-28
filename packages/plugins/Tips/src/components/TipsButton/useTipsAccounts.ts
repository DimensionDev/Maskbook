import { useMemo } from 'react'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useHiddenAddressConfigOf, useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { signWithPersona } from '@masknet/plugin-infra/dom/context'

/**
 * Get Tips accounts, removing the hidden ones,
 * and put the default one at the front.
 */
export function useTipsAccounts(
    identity: IdentityResolved | null | undefined,
    personaPubkey: string | undefined | null,
) {
    const [socialAccounts] = useSocialAccountsAll(identity)
    const userId = identity?.identifier?.userId
    const [hiddenAddresses] = useHiddenAddressConfigOf(personaPubkey, PluginID.Web3Profile, userId, signWithPersona)
    return useMemo(() => {
        if (!hiddenAddresses?.length) return socialAccounts
        const list = socialAccounts
        return list.filter((x) => !hiddenAddresses.some((y) => isSameAddress(y, x.address)))
    }, [hiddenAddresses, socialAccounts, userId])
}
