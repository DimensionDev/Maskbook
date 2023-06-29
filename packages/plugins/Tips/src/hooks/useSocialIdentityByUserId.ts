import { useSocialIdentity } from '@masknet/plugin-infra/content-script'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'
import { useAsync } from 'react-use'

export function useSocialIdentityByUserId(userId?: string) {
    const { getUserIdentity } = useSNSAdaptorContext()
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return getUserIdentity?.(userId)
    }, [userId, getUserIdentity])
    return useSocialIdentity(identity)
}
