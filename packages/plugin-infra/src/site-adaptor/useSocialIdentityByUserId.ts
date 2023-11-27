import { useAsync } from 'react-use'
import { getUserIdentity } from './context.js'
import { useSocialIdentity } from './useSocialIdentity.js'
import type { UseQueryResult } from '@tanstack/react-query'

type T = UseQueryResult

export function useSocialIdentityByUserId(userId?: string) {
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return getUserIdentity?.(userId)
    }, [userId])
    return useSocialIdentity(identity)
}
