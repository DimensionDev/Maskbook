import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../types'
import { useAsset } from './useAsset'

export const CollectibleState = createContainer(useCollectibleState)

export function useCollectibleState(token?: CollectibleToken) {
    const asset = useAsset(token)

    return {
        token,
        asset,
    }
}
