import { useAsync } from 'react-use'
import { getUserIdentity } from './context.js'
import { useSocialIdentity } from './useSocialIdentity.js'

export function useSocialIdentityByUserId(userId?: string) {
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return getUserIdentity?.(userId)
    }, [userId])
    return useSocialIdentity(identity)
}
