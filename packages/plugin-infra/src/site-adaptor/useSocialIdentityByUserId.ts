import { useAsync } from 'react-use'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'
import { useSocialIdentity } from './index.js'

export function useSocialIdentityByUserId(userId?: string) {
    const context = useSiteAdaptorContext()
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return context?.getUserIdentity?.(userId)
    }, [userId, context?.getUserIdentity])
    return useSocialIdentity(identity)
}
