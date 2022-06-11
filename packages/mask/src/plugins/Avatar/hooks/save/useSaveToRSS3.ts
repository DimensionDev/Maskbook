import type { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import { RSS3_KEY_SNS } from '../../constants'
import type { NextIDAvatarMeta } from '../../types'
import { useSaveNFTAvatar } from '../rss3'

export function useSaveToRSS3() {
    const [, saveNFTAvatar] = useSaveNFTAvatar()

    return useAsyncFn(
        async (info: NextIDAvatarMeta, account: string, identifier: ProfileIdentifier) => {
            return saveNFTAvatar(account, info, identifier.network as EnhanceableSite, RSS3_KEY_SNS.TWITTER)
        },
        [saveNFTAvatar],
    )
}
