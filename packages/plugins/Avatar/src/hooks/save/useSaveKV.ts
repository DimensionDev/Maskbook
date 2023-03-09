import { useCallback } from 'react'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import {
    type BindingProof,
    type ECKeyIdentifier,
    type NetworkPluginID,
    getEnhanceableSiteType,
} from '@masknet/shared-base'
import type { NextIDAvatarMeta } from '../../types.js'
import { useSaveAvatar } from './useSaveAvatar.js'

export function useSaveKV(pluginID: NetworkPluginID) {
    const connection = useWeb3Connection<'all'>(pluginID)
    const saveAvatar = useSaveAvatar(pluginID)

    return useCallback(
        async (info: NextIDAvatarMeta, account: string, persona: ECKeyIdentifier, proof: BindingProof) => {
            if (!connection) return

            const siteType = getEnhanceableSiteType()
            if (!siteType) return

            const sign = await connection.signMessage('message', JSON.stringify(info), {
                account,
            })

            return saveAvatar(account, siteType, info, sign)
        },
        [connection, saveAvatar],
    )
}
