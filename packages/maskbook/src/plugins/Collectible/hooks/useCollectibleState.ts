import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../types'
import { useAsset } from './useAsset'

function useCollectibleState(token?: CollectibleToken) {
    const asset = useAsset(token)
    return {
        token,
        asset,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
