/* eslint-disable unicorn/consistent-function-scoping */

import { memoize } from 'lodash-es'
import { EnhanceableSite, getEnhanceableSiteType } from '@masknet/shared-base'
import { type StoreAPI } from '../types/Store.js'
import { getAddress } from './helpers/getAddress.js'
import { getAvatar } from './helpers/getAvatar.js'
import { getAvatarToken } from './helpers/getAvatarToken.js'
import type { Store } from './types.js'
import { getPersonaAvatar } from './helpers/getPersonaAvatar.js'
import { requestIdleCallbackAsync } from '../helpers/requestIdleCallbackAsync.js'
import { StoreProvider } from '../Store/index.js'
import { memoizePromise } from '@masknet/kit'

class AvatarStoreProvider extends StoreProvider<Store> implements StoreAPI.Provider<Store> {
    private getAvatarToken = memoizePromise(
        memoize,
        (userId: string, avatarId?: string, personaPublicKey?: string) => {
            return requestIdleCallbackAsync(async () => {
                const siteType = getEnhanceableSiteType()
                if (!siteType) return null

                const address = await getAddress(siteType, userId)
                if (!address) return null

                const avatar =
                    siteType === EnhanceableSite.Twitter && avatarId && personaPublicKey ?
                        await getPersonaAvatar(siteType, userId, avatarId, personaPublicKey)
                    :   await getAvatar(siteType, userId)
                if (!avatar) return null

                return getAvatarToken(address.networkPluginID, address.address, avatar)
            })
        },
        (userId: string, avatarId?: string, personaPublicKey?: string) =>
            [userId, avatarId, personaPublicKey].join('_'),
    )

    async dispatch(userId: string, avatarId?: string, personaPublicKey?: string): Promise<void> {
        const token = await this.getAvatarToken(userId, avatarId, personaPublicKey)

        this.updateStore((store) => ({
            ...store,
            [[userId, avatarId, personaPublicKey].join('_')]: token,
        }))
    }
}

export const AvatarStore = new AvatarStoreProvider()
