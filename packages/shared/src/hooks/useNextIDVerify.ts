import { currentNextIDPlatform } from '@masknet/plugin-infra/content-script/context'
import { signWithPersona } from '@masknet/plugin-infra/dom/context'
import { MaskMessages, NextIDAction, SignType, languageSettings, type PersonaInformation } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncFn } from 'react-use'
import { VerifyNextIDModal } from '../UI/modals/index.js'

export function useNextIDVerify() {
    return useAsyncFn(
        async (persona?: PersonaInformation, username?: string, verifiedCallback?: () => void | Promise<void>) => {
            if (!currentNextIDPlatform || !persona || !username) return

            const payload = await NextIDProof.createPersonaPayload(
                persona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                username,
                currentNextIDPlatform,
                languageSettings.value ?? 'default',
            )
            if (!payload) throw new Error('Failed to create persona payload.')

            const signature = await signWithPersona?.(SignType.Message, payload.signPayload, persona.identifier, true)
            if (!signature) throw new Error('Failed to sign by persona.')

            const { postId, aborted } = await VerifyNextIDModal.openAndWaitForClose({
                personaInfo: persona,
            })
            if (aborted) return
            if (process.env.NODE_ENV === 'development') {
                if (!postId) {
                    console.error('Failed to get post id')
                }
            }
            if (postId && persona.identifier.publicKeyAsHex) {
                await NextIDProof.bindProof(
                    payload.uuid,
                    persona.identifier.publicKeyAsHex,
                    NextIDAction.Create,
                    currentNextIDPlatform!,
                    username,
                    payload.createdAt,
                    {
                        signature,
                        proofLocation: postId,
                    },
                )
            }

            const isBound = await NextIDProof.queryIsBound(
                persona.identifier.publicKeyAsHex,
                currentNextIDPlatform,
                username,
            )
            if (!isBound) throw new Error('Failed to verify.')

            MaskMessages.events.ownProofChanged.sendToAll(undefined)
            await verifiedCallback?.()
        },
        [],
    )
}
