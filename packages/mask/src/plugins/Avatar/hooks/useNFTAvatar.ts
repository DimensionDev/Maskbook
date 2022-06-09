import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { AvatarMetaDB } from '../types'
import type { RSS3_KEY_SNS } from '../constants'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useGetNFTAvatar } from './useGetNFTAvatar'

export function useNFTAvatar(
    userId: string | undefined,
    snsKey: RSS3_KEY_SNS,
    networkPluginId?: NetworkPluginID,
    chainId?: ChainId,
): AsyncState<AvatarMetaDB | undefined> {
    const [, getNFTAvatar] = useGetNFTAvatar()

    return useAsync(async () => {
        return getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            snsKey,
            networkPluginId ?? NetworkPluginID.PLUGIN_EVM,
            chainId,
        )
    }, [userId, snsKey, networkPluginId, chainId, getNFTAvatar])
}
