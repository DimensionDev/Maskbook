import { useRef } from 'react'
import { useAsyncFn } from 'react-use'
import { NextIDAction, type PersonaInformation, SignType, MaskMessages, toBase64, fromHex } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '#services'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'

async function createAndSignMessage(persona: PersonaInformation, username: string) {
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
    if (!platform) return null

    const payload = await NextIDProof.createPersonaPayload(
        persona.identifier.publicKeyAsHex,
        NextIDAction.Create,
        username,
        platform,
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
    return { payload, signature }
}

export function useNextIDVerify() {
    const verifyPostCollectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const getPostIdFromNewPostToast = activatedSiteAdaptorUI!.configuration.nextIDConfig?.getPostIdFromNewPostToast
    const postMessage = activatedSiteAdaptorUI!.automation?.nativeCompositionDialog?.attachText
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform

    return useAsyncFn(
        async (persona?: PersonaInformation, username?: string, verifiedCallback?: () => void | Promise<void>) => {
            if (!platform || !persona || !username) return

            const message = await createAndSignMessage(persona, username)
            if (!message) return
            const { signature, payload } = message

            const postContent = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            await postMessage?.(postContent, { recover: false, reason: 'verify' })
            await new Promise<void>((resolve, reject) => {
                verifyPostCollectTimer.current = setInterval(async () => {
                    const postId = getPostIdFromNewPostToast?.()
                    if (postId && persona.identifier.publicKeyAsHex) {
                        clearInterval(verifyPostCollectTimer.current!)
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
                        resolve()
                    }
                }, 1000)

                setTimeout(() => {
                    clearInterval(verifyPostCollectTimer.current!)
                    // reject({ message: t('setup_guide_verify_post_not_found') })
                    reject()
                }, 1000 * 20)
            })

            const isBound = await NextIDProof.queryIsBound(persona.identifier.publicKeyAsHex, platform, username)
            if (!isBound) throw new Error('Failed to verify.')

            MaskMessages.events.ownProofChanged.sendToAll()
            await verifiedCallback?.()
        },
        [postMessage, platform],
    )
}
