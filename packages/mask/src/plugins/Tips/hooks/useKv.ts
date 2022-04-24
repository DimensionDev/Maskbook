import { PluginId } from '@masknet/plugin-infra'
import { fromHex, NextIDPlatform, toBase64 } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'

const pluginId = PluginId.Tips

const getCurrentPersonaPublicKey = async () => {
    const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
    if (!currentPersonaIdentifier) return ''
    const currentPersona = await Services.Identity.queryPersona(currentPersonaIdentifier)
    if (!currentPersona?.publicHexKey) return ''
    return currentPersona.publicHexKey
}
export function useKvGet() {
    return useAsyncRetry(async () => {
        const publicHexKey = await getCurrentPersonaPublicKey()
        return NextIDStorage.get(publicHexKey)
    })
}

export const getKvPayload = async (patchData: unknown) => {
    try {
        const data = JSON.parse(JSON.stringify(patchData))
        const publicHexKey = await getCurrentPersonaPublicKey()
        const payload = await NextIDStorage.getPayload(
            publicHexKey,
            NextIDPlatform.NextID,
            publicHexKey,
            data,
            pluginId,
        )
        return payload
    } catch (error) {
        console.error(error)
        return null
    }
}

export const setKvPatchData = async (payload: any, signature: string, patchData: unknown) => {
    try {
        const publicHexKey = await getCurrentPersonaPublicKey()
        const base64Sig = toBase64(fromHex(signature))
        await NextIDStorage.set(
            payload.uuid,
            publicHexKey,
            base64Sig,
            NextIDPlatform.NextID,
            publicHexKey,
            payload.createdAt,
            patchData,
            pluginId,
        )
    } catch (error) {
        console.error(error)
    }
}
