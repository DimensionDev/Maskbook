import { createContainer } from 'unstated-next'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentCollectibleProviderSettings } from '../settings'
import type { CollectibleToken } from '../types'
import { useAsset } from './useAsset'

function useCollectibleState(token?: CollectibleToken) {
    const provider = useValueRef(currentCollectibleProviderSettings)
    const asset = useAsset(provider, token)
    return {
        token,
        asset,
        provider,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
