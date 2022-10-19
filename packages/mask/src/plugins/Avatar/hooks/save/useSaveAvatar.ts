import { useCallback } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID, EnhanceableSite } from '@masknet/shared-base'
import { useSaveAddress } from './useSaveAddress.js'
import type { NextIDAvatarMeta, AvatarMeta } from '../../types.js'
import { NFT_AVATAR_METADATA_STORAGE } from '../../constants.js'

export function useSaveAvatar(pluginID?: NetworkPluginID) {
    const { Storage } = useWeb3State(pluginID)
    const saveAddress = useSaveAddress(pluginID)

    return useCallback(
        async (account: string, network: EnhanceableSite, avatar: NextIDAvatarMeta, sign: string) => {
            if (!Storage || avatar.userId === '$unknown') return
            await saveAddress(avatar.userId, avatar.pluginID ?? NetworkPluginID.PLUGIN_EVM, account, network)
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
