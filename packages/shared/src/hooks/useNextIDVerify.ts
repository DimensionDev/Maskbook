import { currentNextIDPlatform } from '@masknet/plugin-infra/content-script/context'
import { MaskMessages, NextIDAction, type PersonaInformation } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { VerifyNextIDModal } from '../UI/modals/index.js'
import { useCallback } from 'react'

export function useNextIDVerify() {
    return useCallback(
        async (persona?: PersonaInformation, username?: string, verifiedCallback?: () => void | Promise<void>) => {
            if (!currentNextIDPlatform || !persona || !username) return

            const { postId, signature, payload, aborted } = await VerifyNextIDModal.openAndWaitForClose({
                personaInfo: persona,
            })
            if (!payload) throw new Error('Failed to create persona payload.')
            if (!signature) throw new Error('Failed to sign by persona.')
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
