import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { AvatarMetaDB } from '../types.js'
import type { RSS3_KEY_SNS } from '../constants.js'
import { useAsync } from 'react-use'
import { getEnhanceableSiteType } from '@masknet/shared-base'
import { useGetNFTAvatar } from './useGetNFTAvatar.js'

export function useNFTAvatar(userId: string | undefined, snsKey: RSS3_KEY_SNS): AsyncState<AvatarMetaDB | undefined> {
    const getNFTAvatar = useGetNFTAvatar()

    return useAsync(async () => {
        const siteType = getEnhanceableSiteType()
        if (!siteType) return
        return getNFTAvatar(userId, siteType, snsKey)
    }, [userId, snsKey, getNFTAvatar])
}
