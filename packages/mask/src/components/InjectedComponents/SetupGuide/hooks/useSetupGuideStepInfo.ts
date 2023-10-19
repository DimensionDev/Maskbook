import Services from '#services'
import { usePersonaProofs } from '@masknet/shared'
import {
    EnhanceableSite,
    MaskMessages,
    ProfileIdentifier,
    SetupGuideStep,
    isSameProfile,
    resolveNextIDIdentityToProfile,
    userPinExtension,
    type PersonaIdentifier,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../../../DataSource/useActivatedUI.js'
import { useSetupGuideStatus } from '../../../GuideStep/useSetupGuideStatus.js'
import { useCurrentUserId } from './useCurrentUserId.js'

export function useSetupGuideStepInfo(destinedPersona?: PersonaIdentifier) {
    // #region parse setup status
    const lastPinExtensionSetting = useValueRef(userPinExtension)
    const lastSettingState = useSetupGuideStatus()
    // #endregion

    // #region Get username
    const lastRecognized = useLastRecognizedIdentity()
    const [loadingCurrentUserId, currentUserId] = useCurrentUserId()
    const username = lastSettingState.username || currentUserId || ''
    // #endregion

    const { data: personaInfo, refetch } = useQuery(
        ['query-persona-info', destinedPersona?.publicKeyAsHex],
        async () => {
            if (!destinedPersona?.publicKeyAsHex) return null
            return Services.Identity.queryPersona(destinedPersona)
        },
    )
    const { networkIdentifier } = activatedSiteAdaptorUI!

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(() => refetch()), [])

    useEffect(() => {
        if (username || networkIdentifier !== EnhanceableSite.Twitter) return
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

    const composeInfo = (step: SetupGuideStep) => {
        return {
            step,
            userId: username,
            loadingCurrentUserId,
            currentIdentityResolved: lastRecognized,
            destinedPersonaInfo: personaInfo,
        }
    }

    const { data: proofs } = usePersonaProofs(destinedPersona?.publicKeyAsHex)

    if (!personaInfo) return composeInfo(SetupGuideStep.Close)

    // Not set status
    if (!lastSettingState.status) {
        // Should show pin extension when not set
        if (!lastPinExtensionSetting) {
            return composeInfo(SetupGuideStep.PinExtension)
        } else {
            return composeInfo(SetupGuideStep.Close)
        }
    }
    if (!username) return composeInfo(SetupGuideStep.FindUsername)

    // Should connected persona
    const profile = ProfileIdentifier.of(networkIdentifier, username).expect(`${username} should be a valid user id`)
    const personaConnectedProfile = personaInfo.linkedProfiles.find((x) => isSameProfile(x.identifier, profile))
    // Should verified persona
    const verifiedProfile = proofs?.find((x) => {
        return (
            x.is_valid &&
            isSameProfile(resolveNextIDIdentityToProfile(x.identity, x.platform), personaConnectedProfile?.identifier)
        )
    })

    if (lastSettingState.status === SetupGuideStep.VerifyOnNextID) return composeInfo(SetupGuideStep.VerifyOnNextID)

    if (verifiedProfile) return composeInfo(SetupGuideStep.Verified)

    if (!personaConnectedProfile) return composeInfo(SetupGuideStep.FindUsername)

    // NextID is available on this site.
    return composeInfo(SetupGuideStep.Close)
}
