import { useAsync } from 'react-use'
import { getUserIdentity } from './context.js'
import { useSocialIdentity } from './useSocialIdentity.js'
import type { UseQueryResult } from '@tanstack/react-query'
import type { SocialIdentity } from '@masknet/shared-base'

export function useSocialIdentityByUserId(userId?: string): UseQueryResult<SocialIdentity | null> {
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return getUserIdentity?.(userId)
    }, [userId])
    return useSocialIdentity(identity)
}
