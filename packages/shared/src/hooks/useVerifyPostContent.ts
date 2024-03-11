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
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useBaseUIRuntime } from '../UI/contexts/index.js'

type T = UseQueryResult
export function useVerifyPostContent(personaIdentifier: PersonaIdentifier | undefined, userId: string) {
    const { networkIdentifier } = useBaseUIRuntime()

    return useQuery({
        queryKey: ['create-persona-payload', personaIdentifier?.publicKeyAsHex, userId, networkIdentifier],
        networkMode: 'always',
        queryFn: async () => {
            const platform = resolveNetworkToNextIDPlatform(networkIdentifier)
            if (!personaIdentifier?.publicKeyAsHex || !platform) return null
            const payload = await NextIDProof.createPersonaPayload(
                personaIdentifier.publicKeyAsHex,
                NextIDAction.Create,
                userId,
                platform,
            )
            if (!payload) throw new Error('Failed to create persona payload.')

            const signature = await signWithPersona(SignType.Message, payload.signPayload, personaIdentifier, true)
            return payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
        },
    })
}
