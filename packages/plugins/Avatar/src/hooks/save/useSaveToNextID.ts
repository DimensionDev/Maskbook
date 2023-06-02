import { useCallback } from 'react'
import { type BindingProof, type ECKeyIdentifier, NetworkPluginID, getEnhanceableSiteType } from '@masknet/shared-base'
import { Web3Storage } from '@masknet/web3-providers'
import { useSaveAddress } from './useSaveAddress.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { PLUGIN_ID } from '../../constants.js'

export function useSaveToNextID() {
    const saveAddress = useSaveAddress()
    return useCallback(
        async (info: NextIDAvatarMeta, account: string, persona?: ECKeyIdentifier, proof?: BindingProof) => {
            if (!proof?.identity || !persona) return

            const siteType = getEnhanceableSiteType()
            if (!siteType) return

            const storage = Web3Storage.createNextIDStorage(proof.identity, proof.platform, persona)
            await storage.set(PLUGIN_ID, info)

            saveAddress(info.userId, info.pluginId ?? NetworkPluginID.PLUGIN_EVM, account, siteType)

            return info
        },
        [saveAddress],
    )
}
