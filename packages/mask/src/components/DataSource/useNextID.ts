import { useAsyncRetry } from 'react-use'
import type { NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'
import { useMemo, useState } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { usePersonaConnectStatus } from './usePersonaConnectStatus'
import { currentSetupGuideStatus, dismissVerifyNextID } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useValueRef } from '@masknet/shared'
import { queryExistedBindingByPersona, queryExistedBindingByPlatform, queryIsBound } from '@masknet/web3-providers'

export const usePersonaBoundPlatform = (personaPublicKey: string) => {
    return useAsyncRetry(() => {
        return queryExistedBindingByPersona(personaPublicKey)
    }, [personaPublicKey])
}

let isOpenedVerifyDialog = false
let isOpenedFromButton = false

const verifyPersona = (personaIdentifier?: PersonaIdentifier) => async () => {
    if (!personaIdentifier) return
    currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
        status: SetupGuideStep.VerifyOnNextID,
        persona: personaIdentifier.toText(),
    })
}

export const useNextIDBoundByPlatform = (platform: NextIDPlatform, identity: string) => {
    return useAsyncRetry(() => {
        return queryExistedBindingByPlatform(platform, identity)
    }, [platform, identity])
}

export enum NextIDVerificationStatus {
    WaitingLocalConnect = 'need-local-connect',
    WaitingVerify = 'waiting-verify',
    Verified = 'Verified',
    HideVerifyDialog = 'hide-verify-dialog',
    Other = 'Other',
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

    const { value: VerificationStatus = NextIDVerificationStatus.Other, retry } = useAsyncRetry(async () => {
        // Whether in connect to {platform} process
        if (lastState.status === SetupGuideStep.FindUsername) return NextIDVerificationStatus.WaitingLocalConnect

        // Whether it has been opened in a lifecycle
        if (isOpenedVerifyDialog) return NextIDVerificationStatus.HideVerifyDialog

        // Whether current platform support next id
        if (!enableNextID || !username || !personaConnectStatus.connected)
            return NextIDVerificationStatus.WaitingLocalConnect

        const { currentConnectedPersona } = personaConnectStatus
        if (!currentConnectedPersona?.publicHexKey) return NextIDVerificationStatus.WaitingLocalConnect

        // Whether used 'Don't show me again
        if (
            dismissVerifyNextID[ui.networkIdentifier].value[
                `${username}_${currentConnectedPersona.identifier.toText()}`
            ] &&
            !isOpenedFromButton
        )
            return NextIDVerificationStatus.HideVerifyDialog

        // Whether verified in next id server
        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
        if (!platform) return NextIDVerificationStatus.Other

        const isBound = await queryIsBound(currentConnectedPersona.publicHexKey, platform, username)
        if (isBound) return NextIDVerificationStatus.Verified

        isOpenedVerifyDialog = true
        isOpenedFromButton = false
        return NextIDVerificationStatus.WaitingVerify
    }, [username, enableNextID, lastStateRef.value, isOpenedVerifyDialog])

    return {
        isVerified: VerificationStatus === NextIDVerificationStatus.Verified,
        status: VerificationStatus,
        reset: () => {
            isOpenedVerifyDialog = false
            isOpenedFromButton = true
            retry()
        },
        action:
            VerificationStatus === NextIDVerificationStatus.WaitingVerify
                ? verifyPersona(personaConnectStatus.currentConnectedPersona?.identifier)
                : null,
    }
}
