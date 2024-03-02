import type { EnhanceableSite } from '@masknet/shared-base'
import type { Store } from './types.js'

class AvatarStoreProvider {
    subscribe(callback: (store: Store) => void): () => void {
        throw new Error('Not implemented')
    }

    getSnapshot(): Store {
        throw new Error('Not implemented')
    }

    dispatch(siteType: EnhanceableSite, userId: string): Promise<void> {
        throw new Error('Not implemented')
    }
}

export const AvatarStore = new AvatarStoreProvider()
