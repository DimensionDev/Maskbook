import { useRef } from 'react'
import { useAsyncFn } from 'react-use'
import {
    fromHex,
    NextIDAction,
    type PersonaInformation,
    SignType,
    toBase64,
    languageSettings,
    MaskMessages,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { currentNextIDPlatform } from '@masknet/plugin-infra/content-script/context'

export function useNextIDVerify() {
    const verifyPostCollectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { getPostIdFromNewPostToast, postMessage, signWithPersona } = useSiteAdaptorContext()

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

            const postContent = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            postMessage?.(postContent, { recover: false, reason: 'verify' })
            await new Promise<void>((resolve, reject) => {
                verifyPostCollectTimer.current = setInterval(async () => {
                    const postId = getPostIdFromNewPostToast?.()
                    if (postId && persona.identifier.publicKeyAsHex) {
                        clearInterval(verifyPostCollectTimer.current!)
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
                        resolve()
                    }
                }, 1000)

                setTimeout(() => {
                    clearInterval(verifyPostCollectTimer.current!)
                    reject()
                }, 1000 * 20)
            })

            const isBound = await NextIDProof.queryIsBound(
                persona.identifier.publicKeyAsHex,
                currentNextIDPlatform,
                username,
            )
            if (!isBound) throw new Error('Failed to verify.')

            MaskMessages.events.ownProofChanged.sendToAll(undefined)
            await verifiedCallback?.()
        },
        [postMessage, signWithPersona],
    )
}
