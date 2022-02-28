import { useAsync, useAsyncRetry } from 'react-use'
import type { NextIDPlatform } from '@masknet/shared-base'
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
import { queryExistedBindingByPersona, queryExistedBindingByPlatform, queryIsBound } from '@masknet/web3-providers'

export const usePersonaBoundPlatform = (personaPublicKey: string) => {
    useAsyncRetry(() => {
        return queryExistedBindingByPersona(personaPublicKey)
    }, [personaPublicKey])
}

let isOpenedVerifyDialog = false

export const useNextIDBoundByPlatform = (platform: NextIDPlatform, identity: string) => {
    useAsyncRetry(() => {
        return queryExistedBindingByPlatform(platform, identity)
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

        const currentPersona = await Services.Settings.getCurrentPersona()
        if (!currentPersona?.publicHexKey) return true

        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
        const isBound = await queryIsBound(currentPersona.publicHexKey, platform, username)
        if (isBound) return true

        currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
            status: SetupGuideStep.VerifyOnNextID,
            persona: currentPersona?.identifier.toText(),
        })
        isOpenedVerifyDialog = true
        return false
    }, [username, enableNextID, lastStateRef.value])

    return isVerified
}
