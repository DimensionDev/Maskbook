import { usePersonaProofs } from '@masknet/shared'
import {
    NextIDAction,
    SignType,
    fromHex,
    toBase64,
    type PersonaIdentifier,
    ProfileIdentifier,
    MaskMessages,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useAsync, useTimeout } from 'react-use'
import Services from '../../../../shared-ui/service.js'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useSetupGuideStepInfo } from './useSetupGuideStepInfo.js'
import { queryClient } from '@masknet/shared-base-ui'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { EventMap } from '../../../extension/popups/pages/Personas/common.js'

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

export function useCurrentUserId() {
    const lastRecognized = useLastRecognizedIdentity()
    const currentUserId = lastRecognized.identifier?.userId
    // There is not state for getting current userId, setting a timeout for that.
    const [timeout] = useTimeout(5000)
    const [delay] = useTimeout(800)
    const fakeLoading = !delay() // Getting userId is instantly fast, add a fake loading
    const loading = timeout() ? false : fakeLoading || !currentUserId
    return [loading, fakeLoading ? undefined : currentUserId] as const
}

export function useConnectedVerified(pubkey: string | undefined, userId: string) {
    const { data: proofs } = usePersonaProofs(pubkey)
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
    if (!platform || !proofs?.length) return false
    return proofs.some((x) => x.platform === platform && x.identity === userId && x.is_valid)
}

export function usePersonaConnected(persona?: PersonaIdentifier) {
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const { userId, destinedPersonaInfo: personaInfo } = useSetupGuideStepInfo(persona)
    const connected = personaInfo?.linkedProfiles.some(
        (x) => x.identifier.network === site && x.identifier.userId === userId,
    )
    return connected
}

export function useConnectPersona(persona?: PersonaIdentifier) {
    const { step, userId, currentIdentityResolved, destinedPersonaInfo: personaInfo } = useSetupGuideStepInfo(persona)
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const connected = usePersonaConnected(persona)
    const { loading } = useAsync(async () => {
        if (!persona || connected) return
        const id = ProfileIdentifier.of(site, userId)
        if (!id.isSome()) return
        // attach persona with site profile
        await Services.Identity.attachProfile(id.value, persona, {
            connectionConfirmState: 'confirmed',
        })

        if (currentIdentityResolved.avatar) {
            await Services.Identity.updateProfileInfo(id.value, {
                avatarURL: currentIdentityResolved.avatar,
            })
        }
        // auto-finish the setup process
        if (!personaInfo) throw new Error('invalid persona')
        await Services.Identity.setupPersona(personaInfo?.identifier)
        queryClient.invalidateQueries(['query-persona-info', persona.publicKeyAsHex])
        MaskMessages.events.ownPersonaChanged.sendToAll()

        Telemetry.captureEvent(EventType.Access, EventMap[activatedSiteAdaptorUI!.networkIdentifier])
    }, [site, personaInfo, step, persona, userId, currentIdentityResolved.avatar, connected])

    return loading
}
