import { useChainId } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'
import type { AvatarMetaDB } from '../types'

export function useNFTAvatar(userId: string): AsyncState<AvatarMetaDB | undefined> {
    const chainId = useChainId()
    return useAsync(async () => {
        if (!userId) return
        if (userId === '$unknown') return
        return PluginNFTAvatarRPC.getNFTAvatar(userId, chainId)
    }, [userId, chainId])
}
