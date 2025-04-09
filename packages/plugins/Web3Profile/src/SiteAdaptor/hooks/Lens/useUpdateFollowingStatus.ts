import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useUpdateFollowingStatus() {
    const queryClient = useQueryClient()
    return useCallback(
        (myLensAccount: string | undefined, targetLensAccount: string | undefined, isFollowing: boolean) => {
            if (!myLensAccount || !targetLensAccount) return
            queryClient.setQueriesData<FireflyConfigAPI.LensAccount[]>(
                { queryKey: ['lens', 'popup-list', myLensAccount] },
                (data) => {
                    if (!data) return data
                    return data.map((x) => {
                        return x.handle === targetLensAccount ? { ...x, isFollowing } : x
                    })
                },
            )
            queryClient.setQueriesData(
                { queryKey: ['lens', 'following-status', myLensAccount, targetLensAccount] },
                () => isFollowing,
            )
        },
        [queryClient],
    )
}
