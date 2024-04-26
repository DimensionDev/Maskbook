import { getEnhanceableSiteType, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { useSaveAvatar } from './useSaveAvatar.js'
import { useCallback } from 'react'

export function useSaveKV(pluginID: NetworkPluginID) {
    const Web3 = useWeb3Connection(pluginID)
    const saveAvatar = useSaveAvatar(pluginID)

    return useCallback(
        async (info: AvatarNextID<NetworkPluginID>, account: string) => {
            const siteType = getEnhanceableSiteType()
            if (!siteType) return

            const sign = await Web3.signMessage('message', JSON.stringify(info), {
                account,
            })
            return saveAvatar(siteType, account, info, sign)
        },
        [Web3, saveAvatar],
    )
}
