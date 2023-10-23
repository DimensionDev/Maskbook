import Services from '#services'
import {
    EnhanceableSite,
    MaskMessages,
    SetupGuideStep,
    userPinExtension,
    type PersonaIdentifier,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useSetupGuideStatus } from '../../GuideStep/useSetupGuideStatus.js'
import { useCurrentUserId } from './hooks/useCurrentUserId.js'

export function useSetupGuideStepInfo(destinedPersona?: PersonaIdentifier) {
    // #region parse setup status
    const lastPinExtensionSetting = useValueRef(userPinExtension)
    const setupGuide = useSetupGuideStatus()
    // #endregion

    // #region Get username
    const lastRecognized = useLastRecognizedIdentity()
    const [loadingCurrentUserId, currentUserId] = useCurrentUserId()
    const username = setupGuide.username || currentUserId || ''
    // #endregion

    const { data: personaInfo, refetch } = useQuery(
        ['query-persona-info', destinedPersona?.publicKeyAsHex],
        async () => {
            if (!destinedPersona?.publicKeyAsHex) return null
            return Services.Identity.queryPersona(destinedPersona)
        },
    )
    const { data: currentTabId } = useQuery(['current-tab-id'], async () => Services.Helper.getActiveTabId(), {
        refetchOnWindowFocus: true,
    })
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

    const [step, setStep] = useState<SetupGuideStep>(() => {
        if (!setupGuide.status) {
            // Should show pin extension when not set
            if (!lastPinExtensionSetting) {
                return SetupGuideStep.PinExtension
            } else {
                return SetupGuideStep.Close
            }
        }
        if (!username) return SetupGuideStep.FindUsername
        return SetupGuideStep.Close
    })
    const skip = !personaInfo || currentTabId !== setupGuide.tabId
    const composeInfo = useMemo(() => {
        return {
            step: skip ? SetupGuideStep.Close : step,
            setStep,
            userId: username,
            loadingCurrentUserId,
            currentIdentityResolved: lastRecognized,
            destinedPersonaInfo: personaInfo,
            destinedPersona,
        }
    }, [step, username, loadingCurrentUserId, lastRecognized, personaInfo, destinedPersona, skip])

    return composeInfo
}

export const SetupGuideContext = createContainer(useSetupGuideStepInfo)
SetupGuideContext.Provider.displayName = 'SetupGuideProvider'
