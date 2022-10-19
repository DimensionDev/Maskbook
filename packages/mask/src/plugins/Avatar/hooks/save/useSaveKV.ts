import { useCallback } from 'react'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import type { BindingProof, ECKeyIdentifier, EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { useSaveAvatar } from './useSaveAvatar.js'

export function useSaveKV(pluginID: NetworkPluginID) {
    const connection = useWeb3Connection<'all'>(pluginID)
    const saveAvatar = useSaveAvatar(pluginID)

    return useCallback(
        async (info: NextIDAvatarMeta, account: string, persona: ECKeyIdentifier, proof: BindingProof) => {
            if (!connection) return

            const sign = await connection.signMessage(JSON.stringify(info), 'personalSign', {
                account,
            })

            return saveAvatar(account, activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, info, sign)
        },
        [connection, saveAvatar],
    )
}
