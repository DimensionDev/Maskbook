import { useCallback } from 'react'
import { Web3Storage } from '@masknet/web3-providers'
import { NetworkPluginID, type EnhanceableSite } from '@masknet/shared-base'
import { useSaveAddress } from './useSaveAddress.js'
import type { NextIDAvatarMeta, AvatarMeta } from '../../types.js'
import { NFT_AVATAR_METADATA_STORAGE } from '../../constants.js'

export function useSaveAvatar(pluginID?: NetworkPluginID) {
    const saveAddress = useSaveAddress(pluginID)

    return useCallback(
        async (account: string, network: EnhanceableSite, avatar: NextIDAvatarMeta, sign: string) => {
            if (avatar.userId === '$unknown') return
            await saveAddress(avatar.userId, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, account, network)
            const avatarStorage = Web3Storage.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${network}`)
            avatarStorage.set<AvatarMeta>(avatar.userId, {
                ...avatar,
                sign,
            })

            return avatar
        },
        [saveAddress],
    )
}
