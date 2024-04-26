 

import { EnhanceableSite, getEnhanceableSiteType } from '@masknet/shared-base'
import { StoreProvider } from '../Store/index.js'
import { type StoreAPI } from '../types/Store.js'
import { getAddress } from './helpers/getAddress.js'
import { getAvatar } from './helpers/getAvatar.js'
import { getAvatarToken } from './helpers/getAvatarToken.js'
import { getPersonaAvatar } from './helpers/getPersonaAvatar.js'
import type { Store, StoreItem } from './types.js'

class StoreCreator implements Store {
    constructor(public items: Map<string, StoreItem | null>) {}

    private retrieve(userId?: string, avatarId?: string, publicKey?: string): StoreItem | null {
        if (!userId) return null
        return this.items.get([userId, avatarId, publicKey].join('_')) ?? null
    }

    retrieveAddress(userId?: string) {
        return this.retrieve(userId)?.address ?? null
    }

    retrieveAvatar(userId?: string, avatarId?: string, publicKey?: string) {
        return this.retrieve(userId, avatarId, publicKey)?.avatar ?? null
    }

    retrieveToken(userId?: string, avatarId?: string, publicKey?: string) {
        return this.retrieve(userId, avatarId, publicKey)?.token ?? null
    }
}

class AvatarStoreProvider extends StoreProvider<Store> implements StoreAPI.Provider<Store> {
    public store = new StoreCreator(new Map<string, StoreItem | null>())

    public getAvatarToken = async (
        userId: string,
        avatarId?: string,
        publicKey?: string,
    ): Promise<StoreItem | null> => {
        const siteType = getEnhanceableSiteType()
        if (!siteType) return null

        const address = await getAddress(siteType, userId)
        if (!address) {
            return null
        }

        const avatar =
            siteType === EnhanceableSite.Twitter && avatarId ?
                await getPersonaAvatar(siteType, userId, avatarId, publicKey)
            :   await getAvatar(siteType, userId)
        if (!avatar) {
            return null
        }

        const token = await getAvatarToken(address.networkPluginID, address.address, avatar)

        return {
            address,
            avatar,
            token,
        }
    }

    async dispatch(userId: string, avatarId?: string, publicKey?: string): Promise<void> {
        const result = await this.getAvatarToken(userId, avatarId, publicKey)

        this.updateStore((store) => {
            store.items.set([userId, avatarId, publicKey].join('_'), result)
            return new StoreCreator(store.items)
        })
    }
}

export const AvatarStore = new AvatarStoreProvider()
export { getAvatarFromStorage, setAvatarToStorage } from './helpers/storage.js'
