import { BindingProof, ECKeyIdentifier, fromHex, toBase64 } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { useAsyncFn } from 'react-use'
import Services from '../../../../extension/service'
import { PLUGIN_ID } from '../../constants'
import type { NextIDAvatarMeta } from '../../types'

export function useSaveToNextID() {
    return useAsyncFn(async (info: NextIDAvatarMeta, persona?: ECKeyIdentifier, proof?: BindingProof) => {
        if (!proof?.identity || !persona?.publicKeyAsHex) return
        const payload = await NextIDStorage.getPayload(
            persona.publicKeyAsHex,
            proof?.platform,
            proof?.identity,
            info,
            PLUGIN_ID,
        )
        if (!payload.ok) {
            return
        }
        const result = await Services.Identity.generateSignResult(persona, payload.val.signPayload)
        if (!result) return
        const response = await NextIDStorage.set(
            payload.val.uuid,
            persona.publicKeyAsHex,
            toBase64(fromHex(result.signature.signature)),
            proof.platform,
            proof.identity,
            payload.val.createdAt,
            info,
            PLUGIN_ID,
        )
        return response.ok
    })
}
