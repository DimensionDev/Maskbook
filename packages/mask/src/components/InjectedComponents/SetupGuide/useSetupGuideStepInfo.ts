import { useCallback, useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import {
    EnhanceableSite,
    isSameProfile,
    NextIDPlatform,
    PersonaIdentifier,
    ProfileIdentifier,
    resolveNextIDIdentityToProfile,
} from '@masknet/shared-base'
import { usePersonaProofs } from '@masknet/shared'
import { useValueRef } from '@masknet/shared-base-ui'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { userPinExtension } from '../../../../shared/legacy-settings/settings.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { SetupGuideStep } from '../../../../shared/legacy-settings/types.js'
import Services from '../../../extension/service.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { MaskMessages } from '../../../../shared/index.js'
import { useSetupGuideStatus } from '../../GuideStep/useSetupGuideStatus.js'

export const useSetupGuideStepInfo = (destinedPersona: PersonaIdentifier) => {
    const UI = activatedSocialNetworkUI
    const platform = UI.configuration.nextIDConfig?.platform as NextIDPlatform

    // #region parse setup status
    const lastPinExtensionSetting = useValueRef(userPinExtension)
    const lastSettingState = useSetupGuideStatus()
    // #endregion

    console.log('DEBUG: useSetupGuideStepInfo')
    console.log({
        platform,
        lastPinExtensionSetting,
        lastSettingState,
    })

    // #region Get SNS username
    const lastRecognized = useLastRecognizedIdentity()
    const [username, setUsername] = useState(() => lastSettingState.username || lastRecognized.identifier?.userId || '')

    useEffect(() => {
        return UI.collecting.identityProvider?.recognized.addListener((val: IdentityResolved) => {
            if (username === '' && val.identifier) setUsername(val.identifier.userId)
        })
    }, [username])
    // #endregion

    const { value: persona, retry } = useAsyncRetry(async () => {
        return Services.Identity.queryPersona(destinedPersona)
    }, [destinedPersona])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    useEffect(() => {
        if (username || UI.networkIdentifier !== EnhanceableSite.Twitter) return
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

    const { value: proofs } = usePersonaProofs(destinedPersona.publicKeyAsHex, MaskMessages)

    return useAsyncRetry(async () => {
        if (!persona) {
            return composeInfo(SetupGuideStep.Close, 'close')
        }

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
            isSameProfile(x.identifier, ProfileIdentifier.of(UI.networkIdentifier, username).unwrap()),
        )
        if (!personaConnectedProfile) return composeInfo(SetupGuideStep.FindUsername, 'doing')

        // The SNS is enabled NextID
        if (!platform) {
            // Should show pin extension when not set
            return composeInfo(SetupGuideStep.Close, 'close')
        }

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
    }, [lastSettingState.status, persona, username, platform, lastPinExtensionSetting, composeInfo, proofs?.length])
}
