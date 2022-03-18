import { useAsync, useAsyncRetry } from 'react-use'
import type { NextIDPlatform } from '@masknet/shared-base'
import Services from '../../extension/service'
import { useMemo, useState } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { usePersonaConnectStatus } from './usePersonaConnectStatus'
import { currentSetupGuideStatus, dismissVerifyNextID } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useValueRef } from '@masknet/shared-base-ui'
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
    const ui = activatedSocialNetworkUI
    const [enableNextID] = useState(ui.configuration.nextIDConfig?.enable)
    const personaConnectStatus = usePersonaConnectStatus()
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
    const [username] = useState(
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId),
    )

    const { value: isVerified = false } = useAsync(async () => {
        if (isOpenedVerifyDialog) return true
        if (!enableNextID || !username || !personaConnectStatus.connected) return true

        const currentPersona = await Services.Settings.getCurrentPersona()
        if (!currentPersona?.publicHexKey) return true

        if (dismissVerifyNextID[ui.networkIdentifier].value[`${username}_${currentPersona.identifier.toText()}`])
            return true

        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
        if (!platform) return true

        const isBound = await queryIsBound(currentPersona.publicHexKey, platform, username)
        if (isBound) return true

        currentSetupGuideStatus[ui.networkIdentifier].value = stringify({
            status: SetupGuideStep.VerifyOnNextID,
            persona: currentPersona?.identifier.toText(),
        })
        isOpenedVerifyDialog = true
        return false
    }, [username, enableNextID, lastStateRef.value])

    return isVerified
}
