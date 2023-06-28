import { useCallback, useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
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
import Services from '../../../extension/service.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useSetupGuideStatus } from '../../GuideStep/useSetupGuideStatus.js'

export function useSetupGuideStepInfo(destinedPersona: PersonaIdentifier) {
    // #region parse setup status
    const lastPinExtensionSetting = useValueRef(userPinExtension)
    const lastSettingState = useSetupGuideStatus()
    // #endregion

    // #region Get SNS username
    const lastRecognized = useLastRecognizedIdentity()
    const username = lastSettingState.username || lastRecognized.identifier?.userId || ''
    // #endregion

    const { value: persona, retry } = useAsyncRetry(async () => {
        return Services.Identity.queryPersona(destinedPersona)
    }, [destinedPersona])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    useEffect(() => {
        if (username || activatedSocialNetworkUI.networkIdentifier !== EnhanceableSite.Twitter) return
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

    const composeInfo = useCallback(
        (step: SetupGuideStep, stepType: 'close' | 'done' | 'doing' = 'close') => {
            return {
                step,
                userId: username,
                currentIdentityResolved: lastRecognized,
                destinedPersonaInfo: persona,
                type: stepType,
            }
        },
        [username, lastRecognized, persona],
    )

    const { data: proofs } = usePersonaProofs(destinedPersona.publicKeyAsHex, MaskMessages)

    return useMemo(() => {
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
                ProfileIdentifier.of(activatedSocialNetworkUI.networkIdentifier, username).expect(
                    `${username} should be a valid user id`,
                ),
            ),
        )
        if (!personaConnectedProfile) return composeInfo(SetupGuideStep.FindUsername, 'doing')

        // The SNS is enabled NextID
        // Should show pin extension when not set
        if (!activatedSocialNetworkUI.configuration.nextIDConfig?.platform)
            return composeInfo(SetupGuideStep.Close, 'close')

        // Should verified persona
        const verifiedProfile = proofs?.find(
            (x) =>
                isSameProfile(
                    resolveNextIDIdentityToProfile(x.identity, x.platform),
                    personaConnectedProfile?.identifier,
                ) && x.is_valid,
        )
        if (!verifiedProfile) return composeInfo(SetupGuideStep.VerifyOnNextID, 'doing')

        // Default
        return composeInfo(SetupGuideStep.Close, 'done')
    }, [
        lastSettingState.status,
        persona,
        username,
        lastPinExtensionSetting,
        composeInfo,
        proofs?.length,
        lastRecognized.identifier?.userId,
    ])
}
