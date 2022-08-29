import type { EnhanceableSite } from '@masknet/shared-base'
import { useCallback } from 'react'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { RSS3_KEY_SNS } from '../../constants'
import type { NextIDAvatarMeta } from '../../types'
import { useSaveNFTAvatar } from '../rss3'

export function useSaveToRSS3() {
    const saveNFTAvatar = useSaveNFTAvatar()

    return useCallback(
        async (info: NextIDAvatarMeta, account: string) => {
            return saveNFTAvatar(
                account,
                info,
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                RSS3_KEY_SNS.TWITTER,
            )
        },
        [saveNFTAvatar],
    )
}
