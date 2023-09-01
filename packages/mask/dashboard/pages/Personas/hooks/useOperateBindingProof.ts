import { useAsyncFn } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import {
    type ECKeyIdentifier,
    type NextIDAction,
    NextIDPlatform,
    type ProfileIdentifier,
    SignType,
} from '@masknet/shared-base'
import { Messages } from '../../../API.js'
import { Services } from '../../../../shared-ui/service.js'

export function useDeleteBound() {
    return useAsyncFn(
        async (identifier: ECKeyIdentifier, profile: ProfileIdentifier, network: string, action: NextIDAction) => {
            const persona = await Services.Identity.queryPersona(identifier)
            if (!persona) throw new Error('Failed to get persona')
            const username = profile.userId.toLowerCase()
            const platform = network.split('.')[0] || NextIDPlatform.Twitter
            const payload = await NextIDProof.createPersonaPayload(
                persona.identifier.publicKeyAsHex,
                action,
                username,
                platform as NextIDPlatform,
            )
            if (!payload) throw new Error('Failed to create persona payload.')
            const signature = await Services.Identity.signWithPersona(
                SignType.Message,
                payload.signPayload,
                persona.identifier,
                location.origin,
                true,
            )
            if (!signature) throw new Error('Failed to sign by persona.')
            await NextIDProof.bindProof(
                payload.uuid,
                persona.identifier.publicKeyAsHex,
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
