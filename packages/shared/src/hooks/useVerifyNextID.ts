import { publishPost } from '@masknet/plugin-infra/content-script/context'
import { signWithPersona } from '@masknet/plugin-infra/dom/context'
import {
    MaskMessages,
    NextIDAction,
    SignType,
    fromHex,
    resolveNetworkToNextIDPlatform,
    toBase64,
    type NextIDPlatform,
    type PersonaInformation,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncFn } from 'react-use'
import { useBaseUIRuntime } from '../UI/contexts/index.js'

async function createAndSignMessage(platform: NextIDPlatform, persona: PersonaInformation, username: string) {
    const payload = await NextIDProof.createPersonaPayload(
        persona.identifier.publicKeyAsHex,
        NextIDAction.Create,
        username,
        platform,
    )
    if (!payload) throw new Error('Failed to create persona payload.')

    const signature = await signWithPersona(SignType.Message, payload.signPayload, persona.identifier, true)
    if (!signature) throw new Error('Failed to sign by persona.')
    return { payload, signature }
}

export function useVerifyNextID() {
    const { networkIdentifier } = useBaseUIRuntime()
    const platform = resolveNetworkToNextIDPlatform(networkIdentifier)

    return useAsyncFn(
        async (persona?: PersonaInformation, username?: string, verifiedCallback?: () => void | Promise<void>) => {
            if (!platform || !persona || !username) return

            const message = await createAndSignMessage(platform, persona, username)
            if (!message) return
            const { signature, payload } = message

            const postContent = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            const postId = await publishPost?.([postContent], {
                reason: 'verify',
            })
            if (!postId) throw new Error('Failed to verify.')
            if (persona.identifier.publicKeyAsHex) {
                await NextIDProof.bindProof(
                    payload.uuid,
                    persona.identifier.publicKeyAsHex,
                    NextIDAction.Create,
                    platform,
                    username,
                    payload.createdAt,
                    {
                        signature,
                        proofLocation: postId,
                    },
                )
            }

            const isBound = await NextIDProof.queryIsBound(persona.identifier.publicKeyAsHex, platform, username)
            if (!isBound) throw new Error('Failed to verify.')

            MaskMessages.events.ownProofChanged.sendToAll()
            await verifiedCallback?.()
        },
        [platform],
    )
}
