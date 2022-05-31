import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { AvatarMetaDB } from '../types'
import type { RSS3_KEY_SNS } from '../constants'
import { useGetNFTAvatar } from './rss3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'

export function useNFTAvatar(
    userId: string | undefined,
    snsKey: RSS3_KEY_SNS,
    networkPluginId?: NetworkPluginID,
    chainId?: ChainId,
): AsyncState<AvatarMetaDB | undefined> {
    const [, getNFTAvatar] = useGetNFTAvatar()

    return useAsync(async () => {
        return getNFTAvatar(userId, activatedSocialNetworkUI.networkIdentifier, snsKey, networkPluginId, chainId)
    }, [userId, snsKey, networkPluginId, chainId, getNFTAvatar])
}
