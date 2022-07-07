import { fromHex, NextIDPlatform, NextIDStoragePayload, toBase64 } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { PLUGIN_ID } from '../../constants'

export const getKvPayload = async (patchData: unknown, publicHexKey: string, accountId: string) => {
    try {
        const data = JSON.parse(JSON.stringify(patchData))
        const payload = await NextIDStorage.getPayload(publicHexKey, NextIDPlatform.Twitter, accountId, data, PLUGIN_ID)
        return payload
    } catch (error) {
        console.error(error)
        return null
    }
}

export const setKvPatchData = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: NextIDStoragePayload,
    signature: string,
    patchData: unknown,
    publicHexKey: string,
    accountId: string,
) => {
    try {
        const base64Sig = toBase64(fromHex(signature))
        await NextIDStorage.set(
            payload?.uuid,
            publicHexKey,
            base64Sig,
            NextIDPlatform.Twitter,
            accountId,
            payload?.createdAt,
            patchData,
            PLUGIN_ID,
        )
    } catch (error) {
        console.error(error)
    }
}
