import { NextIDAction, SignType, fromHex, toBase64, type PersonaIdentifier } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import Services from '../../../../../shared-ui/service.js'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'

export function usePostContent(personaIdentifier: PersonaIdentifier | undefined, userId: string) {
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform

    const { data: postContent } = useQuery({
        queryKey: ['create-persona-payload', personaIdentifier?.publicKeyAsHex, userId, platform],
        queryFn: async () => {
            if (!personaIdentifier?.publicKeyAsHex || !platform) return null
            const payload = await NextIDProof.createPersonaPayload(
                personaIdentifier.publicKeyAsHex,
                NextIDAction.Create,
                userId,
                platform,
            )
            if (!payload) throw new Error('Failed to create persona payload.')

            const signature = await Services.Identity.signWithPersona(
                SignType.Message,
                payload.signPayload,
                personaIdentifier,
                location.origin,
                true,
            )
            return payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
        },
    })
    return postContent
}
