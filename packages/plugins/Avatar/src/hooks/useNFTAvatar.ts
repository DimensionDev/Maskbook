import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { AvatarMetaDB } from '../types.js'
import type { RSS3_KEY_SITE } from '../constants.js'
import { useAsync } from 'react-use'
import { getEnhanceableSiteType } from '@masknet/shared-base'
import { useGetNFTAvatar } from './useGetNFTAvatar.js'

export function useNFTAvatar(userId: string | undefined, key: RSS3_KEY_SITE): AsyncState<AvatarMetaDB | undefined> {
    const getNFTAvatar = useGetNFTAvatar()

    return useAsync(async () => {
        const siteType = getEnhanceableSiteType()
        if (!siteType) return
        return getNFTAvatar(userId, siteType, key)
    }, [userId, key, getNFTAvatar])
}
