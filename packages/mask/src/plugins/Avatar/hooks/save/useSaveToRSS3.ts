import type { EnhanceableSite } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { RSS3_KEY_SNS } from '../../constants'
import type { NextIDAvatarMeta, SET_NFT_FLAG } from '../../types'
import { useSaveNFTAvatar } from '../rss3'

export function useSaveToRSS3() {
    const [, saveNFTAvatar] = useSaveNFTAvatar()

    return useAsyncFn(
        async (info: NextIDAvatarMeta, account: string, flag: SET_NFT_FLAG) => {
            return saveNFTAvatar(
                account,
                info,
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                RSS3_KEY_SNS.TWITTER,
                flag,
            )
        },
        [saveNFTAvatar],
    )
}
