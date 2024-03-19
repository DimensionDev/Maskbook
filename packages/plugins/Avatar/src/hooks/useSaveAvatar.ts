import { useAsyncFn } from 'react-use'
import { Web3Storage } from '@masknet/web3-providers'
import { type AvatarNextID } from '@masknet/web3-providers/types'
import { NetworkPluginID, type EnhanceableSite } from '@masknet/shared-base'
import { useSaveAddress } from './useSaveAddress.js'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants.js'

export function useSaveAvatar(pluginID?: NetworkPluginID) {
    const [, saveAddress] = useSaveAddress()

    return useAsyncFn(
        async (siteType: EnhanceableSite, account: string, avatar: AvatarNextID<NetworkPluginID>, sign: string) => {
            if (avatar.userId === '$unknown') return
            await saveAddress(avatar.userId, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, account, siteType)
            const avatarStorage = Web3Storage.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${siteType}`)
            await avatarStorage?.set<AvatarNextID<NetworkPluginID>>(avatar.userId, {
                ...avatar,
                sign,
            })
            return avatar
        },
        [saveAddress],
    )
}
