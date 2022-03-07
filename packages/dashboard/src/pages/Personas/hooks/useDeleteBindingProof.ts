import { ECKeyIdentifier, NextIDAction } from '@masknet/shared-base'
import { bindProof, createPersonaPayload } from '@masknet/web3-providers'
import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'

export function useDeleteBound() {
    return useAsyncFn(async (identifier: ECKeyIdentifier, profile, network) => {
        const persona_ = await Services.Identity.queryPersona(identifier)
        const username = profile.userId.toLowerCase()
        const platform = network.split('.')[0] || 'twitter'
        if (!persona_ || !persona_.publicHexKey) throw new Error('Failed to get person')
        const payload = await createPersonaPayload(persona_.publicHexKey, NextIDAction.Delete, username, platform)
        if (!payload) throw new Error('Failed to create persona payload.')
        const signResult = await Services.Identity.signWithPersona({
            method: 'eth',
            message: payload.signPayload,
            identifier: persona_.identifier.toText(),
        })
        if (!signResult) throw new Error('Failed to sign by persona.')
        const signature = signResult.signature.signature
        await bindProof(persona_.publicHexKey, NextIDAction.Delete, platform, username, undefined, signature, undefined)
        await Services.Identity.detachProfile(profile)
    })
}
