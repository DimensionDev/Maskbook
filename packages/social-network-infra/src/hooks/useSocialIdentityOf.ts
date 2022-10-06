import { useIdentity } from './useIdentity.js'
import { useSocialIdentity } from './useSocialIdentity.js'

export function useSocialIdentityOf(userId?: string) {
    const { value: identityResolved } = useIdentity(userId)
    return useSocialIdentity(identityResolved)
}
