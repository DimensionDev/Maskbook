import { usePersonaProofs } from '@masknet/shared'
import {
    NextIDAction,
    SignType,
    fromHex,
    languageSettings,
    toBase64,
    type PersonaIdentifier,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useTimeout } from 'react-use'
import Services from '../../../../shared-ui/service.js'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'

export function usePostContent(personaIdentifier: PersonaIdentifier | undefined, userId: string) {
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
    const language = languageSettings.value ?? 'default'

    const { data: postContent } = useQuery({
        queryKey: ['create-persona-payload', personaIdentifier?.publicKeyAsHex, userId, platform, language],
        queryFn: async () => {
            if (!personaIdentifier?.publicKeyAsHex || !platform) return null
            const payload = await NextIDProof.createPersonaPayload(
                personaIdentifier.publicKeyAsHex,
                NextIDAction.Create,
                userId,
                platform,
                language,
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

export function useCurrentUserId() {
    const lastRecognized = useLastRecognizedIdentity()
    const currentUserId = lastRecognized.identifier?.userId
    // There is not state for getting current userId, setting a timeout for that.
    const [ready] = useTimeout(5000)
    const loading = ready() ? false : !currentUserId
    return [loading, currentUserId] as const
}

export function usePersonaConnected(pubkey: string | undefined, userId: string) {
    const { data: proofs } = usePersonaProofs(pubkey)
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
    if (!platform || !proofs?.length) return false
    return proofs.some((x) => x.platform === platform && x.identity === userId && x.is_valid)
}
