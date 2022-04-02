import { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncFn } from 'react-use'
import { Services, Messages } from '../../../API'

export function useDeleteBound() {
    return useAsyncFn(async (identifier: ECKeyIdentifier, profile, network, action) => {
        const persona_ = await Services.Identity.queryPersona(identifier)
        const username = profile.userId.toLowerCase()
        const platform = network.split('.')[0] || NextIDPlatform.Twitter
        if (!persona_ || !persona_.publicHexKey) throw new Error('Failed to get person')
        const payload = await NextIDProof.createPersonaPayload(persona_.publicHexKey, action, username, platform)
        if (!payload) throw new Error('Failed to create persona payload.')
        const signResult = await Services.Identity.signWithPersona({
            method: 'eth',
            message: payload.signPayload,
            identifier: persona_.identifier.toText(),
        })
        if (!signResult) throw new Error('Failed to sign by persona.')
        const signature = signResult.signature.signature
        await NextIDProof.bindProof(
            payload.uuid,
            persona_.publicHexKey,
            action,
            platform,
            username,
            payload.createdAt,
            {
                signature: signature,
            },
        )
        Services.Identity.detachProfile(profile)
        Messages.events.ownProofChanged.sendToAll(undefined)
    })
}
