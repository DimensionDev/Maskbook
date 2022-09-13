import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { BindingProof, ECKeyIdentifier, EnhanceableSite } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { useSaveAvatar } from './useSaveAvatar.js'

export function useSaveKV(pluginId: NetworkPluginID) {
    const connection = useWeb3Connection<'all'>(pluginId)
    const saveAvatar = useSaveAvatar(pluginId)

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
