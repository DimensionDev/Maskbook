import { useAsyncRetry } from 'react-use'
import type { NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'
import { useEffect, useMemo, useState } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { usePersonaConnectStatus } from './usePersonaConnectStatus'
import { currentPersonaIdentifier, currentSetupGuideStatus, dismissVerifyNextID } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useValueRef } from '@masknet/shared-base-ui'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../extension/service'
import { MaskMessages } from '../../utils'

export const usePersonaBoundPlatform = (personaPublicKey: string) => {
    return useAsyncRetry(() => {
        return NextIDProof.queryExistedBindingByPersona(personaPublicKey)
    }, [personaPublicKey])
}

let isOpenedVerifyDialog = false
let isOpenedFromButton = false

const verifyPersona = (personaIdentifier?: PersonaIdentifier, username?: string) => async () => {
    if (!personaIdentifier) return
    currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
        status: SetupGuideStep.VerifyOnNextID,
        persona: personaIdentifier.toText(),
        username,
    })
}

export const useNextIDBoundByPlatform = (platform?: NextIDPlatform, identity?: string) => {
    const res = useAsyncRetry(() => {
        if (!platform || !identity) return Promise.resolve([])
        return NextIDProof.queryExistedBindingByPlatform(platform, identity)
    }, [platform, identity])
    useEffect(() => MaskMessages.events.ownProofChanged.on(res.retry), [res.retry])
    return res
}

export enum NextIDVerificationStatus {
    WaitingLocalConnect = 'need-local-connect',
    WaitingVerify = 'waiting-verify',
    Verified = 'Verified',
    HideVerifyDialog = 'hide-verify-dialog',
    Other = 'Other',
}

export function useSetupGuideStatusState() {
    const lastState_ = useValueRef(currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier])
    return useMemo<SetupGuideCrossContextStatus>(() => {
        try {
            return JSON.parse(lastState_)
        } catch {
            return {}
        }
    }, [lastState_])
}

export function useNextIDConnectStatus() {
    const ui = activatedSocialNetworkUI
    const [enableNextID] = useState(ui.configuration.nextIDConfig?.enable)
    const personaConnectStatus = usePersonaConnectStatus()
    const lastState = useSetupGuideStatusState()
    const lastRecognized = useLastRecognizedIdentity()
    const username = lastRecognized.identifier?.userId || lastState.username || ''
    const {
        value: VerificationStatus = NextIDVerificationStatus.Other,
        retry,
        loading,
    } = useAsyncRetry(async () => {
        // Whether in connect to {platform} process
        if (lastState.status === SetupGuideStep.FindUsername) return NextIDVerificationStatus.WaitingLocalConnect

        // Whether it has been opened in a lifecycle
        if (isOpenedVerifyDialog && !isOpenedFromButton) return NextIDVerificationStatus.HideVerifyDialog

        // Whether current platform support next id
        if (!enableNextID || !username || !personaConnectStatus.connected)
            return NextIDVerificationStatus.WaitingLocalConnect

        const { currentConnectedPersona } = personaConnectStatus

        const currentPersonaIdentity = await Services.Settings.getCurrentPersonaIdentifier()

        if (currentPersonaIdentity !== currentConnectedPersona?.identifier)
            return NextIDVerificationStatus.WaitingLocalConnect

        if (!currentConnectedPersona) return NextIDVerificationStatus.WaitingLocalConnect

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

        const isBound = await NextIDProof.queryIsBound(
            currentConnectedPersona.identifier.publicKeyAsHex,
            platform,
            username,
        )
        if (isBound) return NextIDVerificationStatus.Verified

        if (isOpenedFromButton) {
            verifyPersona(personaConnectStatus.currentConnectedPersona?.identifier)()
        }
        isOpenedVerifyDialog = true
        isOpenedFromButton = false
        return NextIDVerificationStatus.WaitingVerify
    }, [username, enableNextID, isOpenedVerifyDialog, personaConnectStatus, currentPersonaIdentifier.value])

    return {
        isVerified: VerificationStatus === NextIDVerificationStatus.Verified,
        status: VerificationStatus,
        loading,
        reset: () => {
            isOpenedVerifyDialog = false
            isOpenedFromButton = true
            retry()
        },
        action:
            VerificationStatus === NextIDVerificationStatus.WaitingVerify
                ? verifyPersona(personaConnectStatus.currentConnectedPersona?.identifier, lastState.username)
                : null,
    }
}
