import { signWithPersona } from '@masknet/plugin-infra/dom/context'
import {
    NextIDAction,
    SignType,
    fromHex,
    resolveNetworkToNextIDPlatform,
    toBase64,
    type PersonaIdentifier,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useBaseUIRuntime } from '../UI/contexts/index.js'

/**
 * Get verify payload, signature and post content
 */
export function useVerifyContent(personaIdentifier: PersonaIdentifier | undefined, userId: string) {
    const { networkIdentifier } = useBaseUIRuntime()

    const publicKeyAsHex = personaIdentifier?.publicKeyAsHex
    return useQuery({
        queryKey: ['create-persona-payload', publicKeyAsHex, userId, networkIdentifier, personaIdentifier],
        networkMode: 'always',
        queryFn: async () => {
            const platform = resolveNetworkToNextIDPlatform(networkIdentifier)
            if (!publicKeyAsHex || !platform) return null
            const payload = await NextIDProof.createPersonaPayload(
                publicKeyAsHex,
                NextIDAction.Create,
                userId,
                platform,
            )
            if (!payload) throw new Error('Failed to create persona payload.')

            const signature = await signWithPersona(SignType.Message, payload.signPayload, personaIdentifier, true)
            const post = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            return {
                post,
                payload,
                signature,
            }
        },
    })
}
