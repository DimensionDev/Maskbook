import type { IdentityResolved } from '@masknet/plugin-infra'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'

/**
 * Get Tips accounts, removing the hidden ones,
 * and put the default one at the front.
 *
 * @internal
 */
export function useTipsAccounts(identity: IdentityResolved | null | undefined) {
    const [socialAccounts] = useSocialAccountsAll(identity)
    return socialAccounts
}
