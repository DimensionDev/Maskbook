import { getEnhanceableSiteType } from '@masknet/shared-base'
import { useCallback } from 'react'
import { RSS3_KEY_SNS } from '../../constants.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { useSaveNFTAvatar } from '../rss3/index.js'

export function useSaveToRSS3() {
    const saveNFTAvatar = useSaveNFTAvatar()

    return useCallback(
        async (info: NextIDAvatarMeta, account: string) => {
            const siteType = getEnhanceableSiteType()
            if (!siteType) return
            return saveNFTAvatar(account, info, siteType, RSS3_KEY_SNS.TWITTER)
        },
        [saveNFTAvatar],
    )
}
