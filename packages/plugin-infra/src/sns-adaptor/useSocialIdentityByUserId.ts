import { useAsync } from 'react-use'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'
import { useSocialIdentity } from './index.js'

export function useSocialIdentityByUserId(userId?: string) {
    const { getUserIdentity } = useSiteAdaptorContext()
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return getUserIdentity?.(userId)
    }, [userId, getUserIdentity])
    return useSocialIdentity(identity)
}
