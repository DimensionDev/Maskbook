import { useEffect, useState } from 'react'
import { usePersonaProofs } from '@masknet/shared'
import {
    EnhanceableSite,
    isSameProfile,
    type PersonaIdentifier,
    ProfileIdentifier,
    resolveNextIDIdentityToProfile,
    userPinExtension,
    MaskMessages,
    SetupGuideStep,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import Services from '#services'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useSetupGuideStatus } from '../../GuideStep/useSetupGuideStatus.js'
import { useQuery } from '@tanstack/react-query'

export function useSetupGuideStepInfo(destinedPersona: PersonaIdentifier) {
    // #region parse setup status
    const lastPinExtensionSetting = useValueRef(userPinExtension)
    const lastSettingState = useSetupGuideStatus()
    // #endregion

    // #region Get username
    const lastRecognized = useLastRecognizedIdentity()
    const username = lastSettingState.username || lastRecognized.identifier?.userId || ''
    // #endregion

    const { data: persona, refetch } = useQuery(['query-persona-info', destinedPersona.publicKeyAsHex], async () => {
        return Services.Identity.queryPersona(destinedPersona)
    })

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(() => refetch()), [])

    useEffect(() => {
        if (username || activatedSiteAdaptorUI!.networkIdentifier !== EnhanceableSite.Twitter) return
        // In order to collect user info after login, need to reload twitter once
        let reloaded = false
        const handler = () => {
            // twitter will redirect to home page after login
            if (!(!reloaded && location.pathname === '/home')) return
            reloaded = true
            location.reload()
        }
        window.addEventListener('locationchange', handler)
        return () => {
            window.removeEventListener('locationchange', handler)
        }
    }, [username])

    const [confirmConnected, setConfirmConnected] = useState(false)
    const composeInfo = (step: SetupGuideStep, stepType: 'close' | 'done' | 'doing' = 'close') => {
        return {
            step,
            userId: username,
            currentIdentityResolved: lastRecognized,
            destinedPersonaInfo: persona,
            type: stepType,
            setConfirmConnected,
        }
    }

    const { data: proofs } = usePersonaProofs(destinedPersona.publicKeyAsHex)

    if (!persona || !username) return composeInfo(SetupGuideStep.Close, 'close')

    // Not set status
    if (!lastSettingState.status) {
        // Should show pin extension when not set
        if (!lastPinExtensionSetting) {
            return composeInfo(SetupGuideStep.PinExtension, 'doing')
        } else {
            return composeInfo(SetupGuideStep.Close, 'close')
        }
    }

    // Should connected persona
    const personaConnectedProfile = persona?.linkedProfiles.find((x) =>
        isSameProfile(
            x.identifier,
            ProfileIdentifier.of(activatedSiteAdaptorUI!.networkIdentifier, username).expect(
                `${username} should be a valid user id`,
            ),
        ),
    )

    if (!personaConnectedProfile || (!confirmConnected && lastSettingState.status !== SetupGuideStep.VerifyOnNextID))
        return composeInfo(SetupGuideStep.FindUsername, 'doing')

    // NextID is available on this site.
    // Should show pin extension when not set
    if (!activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform) return composeInfo(SetupGuideStep.Close, 'close')

    // Should verified persona
    const verifiedProfile = proofs?.find((x) => {
        return (
            isSameProfile(
                resolveNextIDIdentityToProfile(x.identity, x.platform),
                personaConnectedProfile?.identifier,
            ) && x.is_valid
        )
    })
    if (!verifiedProfile) return composeInfo(SetupGuideStep.VerifyOnNextID, 'doing')

    // Default
    return composeInfo(SetupGuideStep.Close, 'done')
}
