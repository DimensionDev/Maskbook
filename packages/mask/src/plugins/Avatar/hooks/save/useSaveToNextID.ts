import { useCallback } from 'react'
import { BindingProof, ECKeyIdentifier, EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { useSaveAddress } from './useSaveAddress.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { PLUGIN_ID } from '../../constants.js'

export function useSaveToNextID() {
    const { Storage } = useWeb3State()
    const saveAddress = useSaveAddress()
    return useCallback(
        async (info: NextIDAvatarMeta, account: string, persona?: ECKeyIdentifier, proof?: BindingProof) => {
            if (!proof?.identity || !persona || !Storage) return
            const storage = Storage.createNextIDStorage(proof.identity, proof.platform, persona)

            await storage.set(PLUGIN_ID, info)

            saveAddress(
                info.userId,
                info.pluginId ?? NetworkPluginID.PLUGIN_EVM,
                account,
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            )

            return info
        },
        [saveAddress, Storage],
    )
}
