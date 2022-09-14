import {
    EnhanceableSite,
    isSameProfile,
    NextIDPlatform,
    PersonaIdentifier,
    ProfileIdentifier,
    resolveNextIDIdentityToProfile,
} from '@masknet/shared-base'
import { currentSetupGuideStatus, userPinExtension } from '../../../../shared/legacy-settings/settings'
import { useValueRef } from '@masknet/shared-base-ui'
import { activatedSocialNetworkUI } from '../../../social-network'
import { SetupGuideContext, SetupGuideStep } from '../../../../shared/legacy-settings/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../extension/service'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { MaskMessages } from '../../../../shared'

export const useSetupGuideStepInfo = (destinedPersona: PersonaIdentifier) => {
    const ui = activatedSocialNetworkUI
    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform

    // #region parse setup status
    const _lastSettingState = useValueRef(currentSetupGuideStatus[ui.networkIdentifier])
    const lastSettingState = useMemo<SetupGuideContext>(() => {
        try {
            return JSON.parse(_lastSettingState)
        } catch {
            return {}
        }
    }, [_lastSettingState])
    // #endregion

    // #region Get SNS username
    const lastRecognized = useLastRecognizedIdentity()
    const getUsername = () => lastSettingState.username || lastRecognized.identifier?.userId || ''
    const [username, setUsername] = useState(getUsername)

    useEffect(() => {
        const handler = (val: IdentityResolved) => {
            if (username === '' && val.identifier) setUsername(val.identifier.userId)
        }
        return ui.collecting.identityProvider?.recognized.addListener(handler)
    }, [username])
    // #endregion

    const { value: persona, retry } = useAsyncRetry(async () => {
        return Services.Identity.queryPersona(destinedPersona)
    }, [destinedPersona])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    useEffect(() => {
        if (username || ui.networkIdentifier !== EnhanceableSite.Twitter) return
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
        [username, lastRecognized],
    )

    return useAsyncRetry(async () => {
        // Not set status
        if (!lastSettingState.status || !persona) {
            return composeInfo(SetupGuideStep.Close, 'close')
        }

        const profileIdentifier = ProfileIdentifier.of(ui.networkIdentifier, username).unwrap()

        // Should connected persona
        const personaConnectedProfile = persona?.linkedProfiles.find((x) =>
            isSameProfile(x.identifier, profileIdentifier),
        )
        if (!personaConnectedProfile) return composeInfo(SetupGuideStep.FindUsername, 'doing')

        // The SNS is enabled NextID
        if (!platform) {
            // Should show pin extension when not set
            if (!userPinExtension.value) {
                userPinExtension.value = true
                return composeInfo(SetupGuideStep.PinExtension, 'doing')
            }
            return composeInfo(SetupGuideStep.Close, 'close')
        }

        // Should verified persona
        const nextIDInfo = await NextIDProof.queryExistedBindingByPersona(persona.identifier.publicKeyAsHex, false)
        const verifiedProfile = nextIDInfo?.proofs.find(
            (x) =>
                isSameProfile(
                    resolveNextIDIdentityToProfile(x.identity, x.platform),
                    personaConnectedProfile?.identifier,
                ) && x.is_valid,
        )
        if (!verifiedProfile) return composeInfo(SetupGuideStep.VerifyOnNextID, 'doing')

        // Should show pin extension when not set
        if (!userPinExtension.value) {
            userPinExtension.value = true
            return composeInfo(SetupGuideStep.PinExtension, 'doing')
        }

        // Default
        return composeInfo(SetupGuideStep.Close, 'done')
    }, [lastSettingState, persona, username, ui.networkIdentifier, platform, userPinExtension, composeInfo])
}
