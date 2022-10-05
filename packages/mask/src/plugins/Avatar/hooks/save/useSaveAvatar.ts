import { useCallback } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useSaveAddress } from './useSaveAddress.js'
import type { NextIDAvatarMeta, AvatarMeta } from '../../types.js'
import { NFT_AVATAR_METADATA_STORAGE } from '../../constants.js'

export function useSaveAvatar(pluginId?: NetworkPluginID) {
    const { Storage } = useWeb3State(pluginId)
    const saveAddress = useSaveAddress(pluginId)

    return useCallback(
        async (account: string, network: EnhanceableSite, avatar: NextIDAvatarMeta, sign: string) => {
            if (!Storage || avatar.userId === '$unknown') return
            await saveAddress(avatar.userId, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, account, network)
            const avatarStorage = Storage.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${network}`)
            avatarStorage?.set<AvatarMeta>(avatar.userId, {
                ...avatar,
                sign,
            })

            return avatar
        },
        [Storage, saveAddress],
    )
}
