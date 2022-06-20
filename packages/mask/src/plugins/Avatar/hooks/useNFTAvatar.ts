import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { activatedSocialNetworkUI } from '../../../social-network'
import { AvatarMetaDB, SET_NFT_FLAG } from '../types'
import type { RSS3_KEY_SNS } from '../constants'
import { useAsync } from 'react-use'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useGetNFTAvatar } from './useGetNFTAvatar'

export function useNFTAvatar(
    userId: string | undefined,
    snsKey: RSS3_KEY_SNS,
    flag?: SET_NFT_FLAG,
): AsyncState<AvatarMetaDB | undefined> {
    const [, getNFTAvatar] = useGetNFTAvatar()

    return useAsync(async () => {
        return getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            snsKey,
            flag ?? SET_NFT_FLAG.NFT_PFP,
        )
    }, [userId, snsKey, getNFTAvatar, flag])
}
