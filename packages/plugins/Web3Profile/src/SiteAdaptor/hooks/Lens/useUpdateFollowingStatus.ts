import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useUpdateFollowingStatus() {
    const queryClient = useQueryClient()
    return useCallback(
        (lensId: string | undefined, targetLensHandle: string | undefined, isFollowing: boolean) => {
            if (!lensId || !targetLensHandle) return
            queryClient.setQueriesData<FireflyConfigAPI.LensAccount[]>(
                { queryKey: ['lens', 'popup-list', lensId] },
                (data) => {
                    if (!data) return data
                    return data.map((x) => {
                        return x.handle === targetLensHandle ? { ...x, isFollowing } : x
                    })
                },
            )
            queryClient.setQueriesData(
                { queryKey: ['lens', 'following-status', lensId, targetLensHandle] },
                () => isFollowing,
            )
        },
        [queryClient],
    )
}
