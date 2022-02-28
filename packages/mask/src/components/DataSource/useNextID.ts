import { useAsync, useAsyncRetry } from 'react-use'
import type { NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'
import Services from '../../extension/service'
import { useMemo, useState } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { usePersonaConnectStatus } from './usePersonaConnectStatus'
import { currentSetupGuideStatus } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useValueRef } from '@masknet/shared'

export const usePersonaBoundPlatform = (personaIdentifier: PersonaIdentifier) => {
    useAsyncRetry(() => {
        return Services.NextID.queryExistedBindingByPersona(personaIdentifier)
    }, [personaIdentifier.toText()])
}

let isOpenedVerifyDialog = false

export const useNextIDBoundByPlatform = (platform: NextIDPlatform, identity: string) => {
    useAsyncRetry(() => {
        return Services.NextID.queryExistedBindingByPlatform(platform, identity)
    }, [platform, identity])
}

export function useNextIDConnectStatus() {
    const [enableNextID] = useState(activatedSocialNetworkUI.configuration.nextIDConfig?.enable)
    const personaConnectStatus = usePersonaConnectStatus()
    const ui = activatedSocialNetworkUI
    const lastStateRef = currentSetupGuideStatus[ui.networkIdentifier]
    const lastState_ = useValueRef(lastStateRef)
    const lastState = useMemo<SetupGuideCrossContextStatus>(() => {
        try {
            return JSON.parse(lastState_)
        } catch {
            return {}
        }
    }, [lastState_])

    const lastRecognized = useLastRecognizedIdentity()
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username] = useState(getUsername)

    const { value: isVerified } = useAsync(async () => {
        if (isOpenedVerifyDialog) return true
        if (!enableNextID || !username || !personaConnectStatus.connected) return true

        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersonaIdentifier) return true

        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
        const isBound = await Services.NextID.queryIsBound(currentPersonaIdentifier, platform, username)
        if (isBound) return true

        currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
            status: SetupGuideStep.VerifyOnNextID,
            persona: currentPersonaIdentifier?.toText(),
        })
        isOpenedVerifyDialog = true
        return false
    }, [username, enableNextID, lastStateRef.value])

    return isVerified
}
