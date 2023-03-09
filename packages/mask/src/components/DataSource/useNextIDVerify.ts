import { useRef } from 'react'
import { useAsyncFn } from 'react-use'
import { fromHex, NextIDAction, type PersonaInformation, SignType, toBase64 } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../extension/service.js'
import { MaskMessages } from '../../utils/index.js'
import { languageSettings } from '../../../shared/legacy-settings/settings.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'

export function useNextIDVerify() {
    const verifyPostCollectTimer = useRef<NodeJS.Timer | null>(null)
    const collectVerificationPost = activatedSocialNetworkUI.configuration.nextIDConfig?.collectVerificationPost
    const postMessage = activatedSocialNetworkUI.automation?.nativeCompositionDialog?.appendText
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform

    return useAsyncFn(
        async (persona?: PersonaInformation, username?: string, verifiedCallback?: () => void | Promise<void>) => {
            if (!platform || !persona || !username) return

            const payload = await NextIDProof.createPersonaPayload(
                persona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                username,
                platform,
                languageSettings.value ?? 'default',
            )
            if (!payload) throw new Error('Failed to create persona payload.')

            const signature = await Services.Identity.signWithPersona(
                SignType.Message,
                payload.signPayload,
                persona.identifier,
                true,
            )
            if (!signature) throw new Error('Failed to sign by persona.')

            const postContent = payload.postContent.replace('%SIG_BASE64%', toBase64(fromHex(signature)))
            postMessage?.(postContent, { recover: false })

            await new Promise<void>((resolve, reject) => {
                verifyPostCollectTimer.current = setInterval(async () => {
                    const post = collectVerificationPost?.(postContent)
                    if (post && persona.identifier.publicKeyAsHex) {
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
                                proofLocation: post.postId,
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

            MaskMessages.events.ownProofChanged.sendToAll(undefined)
            await verifiedCallback?.()
        },
        [postMessage, platform],
    )
}
