import { type BindingProof, type ECKeyIdentifier, NetworkPluginID, getEnhanceableSiteType } from '@masknet/shared-base'
import { Web3Storage } from '@masknet/web3-providers'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { signWithPersona } from '@masknet/plugin-infra/dom/context'
import { useSaveAddress } from './useSaveAddress.js'
import { PLUGIN_ID } from '../constants.js'
import { useCallback } from 'react'

export function useSaveToNextID() {
    const saveAddress = useSaveAddress()
    return useCallback(
        async (
            info: AvatarNextID<NetworkPluginID>,
            account: string,
            persona?: ECKeyIdentifier,
            proof?: BindingProof,
        ) => {
            if (!proof?.identity || !persona) return

            const siteType = getEnhanceableSiteType()
            if (!siteType) return

            const storage = Web3Storage.createNextIDStorage(proof.identity, proof.platform, persona, signWithPersona)
            await storage.set(PLUGIN_ID, info)

            await saveAddress(info.userId, info.pluginId || NetworkPluginID.PLUGIN_EVM, account, siteType)

            return info
        },
        [saveAddress],
    )
}
