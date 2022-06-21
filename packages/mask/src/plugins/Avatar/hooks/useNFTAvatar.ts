import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { activatedSocialNetworkUI } from '../../../social-network'
import { AvatarMetaDB, NFT_USAGE } from '../types'
import type { RSS3_KEY_SNS } from '../constants'
import { useAsync } from 'react-use'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useGetNFTAvatar } from './useGetNFTAvatar'

export function useNFTAvatar(
    userId: string | undefined,
    snsKey: RSS3_KEY_SNS,
    nftUsage?: NFT_USAGE,
): AsyncState<AvatarMetaDB | undefined> {
    const [, getNFTAvatar] = useGetNFTAvatar()

    return useAsync(async () => {
        return getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            snsKey,
            nftUsage ?? NFT_USAGE.NFT_PFP,
        )
    }, [userId, snsKey, getNFTAvatar, nftUsage])
}
