import Services from '#services'
import {
    EnhanceableSite,
    MaskMessages,
    SetupGuideStep,
    userPinExtension,
    type PersonaIdentifier,
} from '@masknet/shared-base'
import { useValueRef, createContainer } from '@masknet/shared-base-ui'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useSetupGuideStatus } from '../../GuideStep/useSetupGuideStatus.js'
import { useCurrentUserId } from './hooks/useCurrentUserId.js'
import { useConnectedVerified } from './hooks/useConnectedVerified.js'

export function useSetupGuideStepInfo(persona?: PersonaIdentifier) {
    // #region parse setup status
    const lastPinExtensionSetting = useValueRef(userPinExtension)
    const setupGuide = useSetupGuideStatus()
    // #endregion

    const myIdentity = useLastRecognizedIdentity()
    const [loadingCurrentUserId, currentUserId] = useCurrentUserId()
    const userId = setupGuide.username || currentUserId || ''

    const {
        data: personaInfo,
        isFetching: checkingConnected,
        refetch,
    } = useQuery({
        enabled: !!persona?.publicKeyAsHex,
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ['query-persona-info', persona?.publicKeyAsHex],
        queryFn: persona ? async () => Services.Identity.queryPersona(persona) : skipToken,
    })
    useEffect(() => MaskMessages.events.ownPersonaChanged.on(() => refetch()), [])
    const { data: currentTabId } = useQuery({
        queryKey: ['current-tab-id'],
        queryFn: async () => Services.Helper.getActiveTab().then((x) => x?.id),
        refetchOnWindowFocus: true,
    })
    const { networkIdentifier: site, configuration } = activatedSiteAdaptorUI!
    const nextIdPlatform = configuration.nextIDConfig?.platform
    const [checkingVerified, verified] = useConnectedVerified(personaInfo?.identifier?.publicKeyAsHex, userId)
    const connected = personaInfo?.linkedProfiles.some(
        (x) => x.identifier.network === site && x.identifier.userId === userId,
    )

    useEffect(() => {
        if (userId || site !== EnhanceableSite.Twitter) return
        // In order to collect user info after login, need to reload twitter once
        let reloaded = false
        const handler = () => {
            // twitter will redirect to home page after login
            if (!(!reloaded && location.pathname === '/home')) return
            reloaded = true
            location.reload()
        }
        window.addEventListener('locationchange', handler)
        return () => window.removeEventListener('locationchange', handler)
    }, [userId])

    const [isFirstConnection, setIsFirstConnection] = useState(false)
    const step = useMemo(() => {
        if (!setupGuide.status) {
            // Should show pin extension when not set
            if (!lastPinExtensionSetting) {
                return SetupGuideStep.PinExtension
            } else {
                return SetupGuideStep.Close
            }
        }
        const nextStep = isFirstConnection ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.CheckConnection
        if (checkingVerified || checkingConnected || loadingCurrentUserId) return nextStep
        if (!connected || (nextIdPlatform && !verified)) {
            return SetupGuideStep.VerifyOnNextID
        }
        return nextStep
    }, [
        setupGuide.status,
        checkingVerified,
        checkingConnected,
        connected,
        verified,
        isFirstConnection,
        loadingCurrentUserId,
    ])
    const skip = !personaInfo || currentTabId !== setupGuide.tabId
    // Will show connect result the first time for sites that don't need to verify nextId.
    return {
        step: skip ? SetupGuideStep.Close : step,
        userId,
        currentUserId,
        loadingCurrentUserId,
        myIdentity,
        personaInfo,
        isFirstConnection,
        setIsFirstConnection,
        checkingConnected,
        checkingVerified,
        verified,
        connected,
    }
}

export const SetupGuideContext = createContainer(useSetupGuideStepInfo)
SetupGuideContext.Provider.displayName = 'SetupGuideProvider'
