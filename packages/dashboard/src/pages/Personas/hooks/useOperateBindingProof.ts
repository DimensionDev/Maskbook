import { ECKeyIdentifier, NextIDAction, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import { Services, Messages } from '../../../API'

export function useDeleteBound() {
    return useAsyncFn(
        async (identifier: ECKeyIdentifier, profile: ProfileIdentifier, network: string, action: NextIDAction) => {
            const persona_ = await Services.Identity.queryPersona(identifier)
            const username = profile.userId.toLowerCase()
            const platform = network.split('.')[0] || NextIDPlatform.Twitter
            if (!persona_) throw new Error('Failed to get persona')
            const payload = await Services.Helper.createPersonaPayload(
                persona_.identifier.publicKeyAsHex,
                action,
                username,
                platform as NextIDPlatform,
            )
            if (!payload) throw new Error('Failed to create persona payload.')
            const signResult = await Services.Identity.signWithPersona({
                method: 'eth',
                message: payload.signPayload,
                identifier: persona_.identifier,
            })
            if (!signResult) throw new Error('Failed to sign by persona.')
            const signature = signResult.signature.signature
            await Services.Helper.bindProof(
                payload.uuid,
                persona_.identifier.publicKeyAsHex,
                action,
                platform,
                username,
                payload.createdAt,
                {
                    signature,
                },
            )
            Services.Identity.detachProfile(profile)
            Messages.events.ownProofChanged.sendToAll(undefined)
        },
    )
}
