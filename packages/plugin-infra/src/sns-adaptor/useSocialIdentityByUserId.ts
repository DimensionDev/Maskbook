import { useAsync } from 'react-use'
import { useSNSAdaptorContext } from '../dom/useSNSAdaptorContext.js'
import { useSocialIdentity } from './index.js'

export function useSocialIdentityByUserId(userId?: string) {
    const { getUserIdentity } = useSNSAdaptorContext()
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return getUserIdentity?.(userId)
    }, [userId, getUserIdentity])
    return useSocialIdentity(identity)
}
