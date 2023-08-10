import { useAsyncRetry } from 'react-use'
import stringify from 'json-stable-stringify'
import {
    SetupGuideStep,
    type NextIDPlatform,
    type PersonaIdentifier,
    dismissVerifyNextID,
    currentPersonaIdentifier,
    currentSetupGuideStatus,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { usePersonaConnectStatus } from './usePersonaConnectStatus.js'
import { useLastRecognizedIdentity } from './useActivatedUI.js'
import Services from '../../extension/service.js'
import { useSetupGuideStatus } from '../GuideStep/useSetupGuideStatus.js'

let isOpenedVerifyDialog = false
let isOpenedFromButton = false

export const verifyPersona = (personaIdentifier?: PersonaIdentifier, username?: string) => async () => {
    if (!personaIdentifier) return
    currentSetupGuideStatus[activatedSiteAdaptorUI.networkIdentifier].value = stringify({
        status: SetupGuideStep.VerifyOnNextID,
        persona: personaIdentifier.toText(),
        username,
    })
}

export enum NextIDVerificationStatus {
    WaitingLocalConnect = 'need-local-connect',
    WaitingVerify = 'waiting-verify',
    Verified = 'Verified',
    HideVerifyDialog = 'hide-verify-dialog',
    Other = 'Other',
}

export function useNextIDConnectStatus(disableInitialVerify = false) {
    const ui = activatedSiteAdaptorUI
    const lastRecognized = useLastRecognizedIdentity()
    const personaConnectStatus = usePersonaConnectStatus()
    const lastState = useSetupGuideStatus()
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
        if (!ui.configuration.nextIDConfig?.enable || !username || !personaConnectStatus.connected)
            return NextIDVerificationStatus.WaitingLocalConnect

        const { currentPersona } = personaConnectStatus

        const currentPersonaIdentity = await Services.Settings.getCurrentPersonaIdentifier()

        if (currentPersonaIdentity !== currentPersona?.identifier) return NextIDVerificationStatus.WaitingLocalConnect

        if (!currentPersona) return NextIDVerificationStatus.WaitingLocalConnect

        // Whether used 'Don't show me again
        if (
            dismissVerifyNextID[ui.networkIdentifier].value[`${username}_${currentPersona.identifier.toText()}`] &&
            !isOpenedFromButton
        )
            return NextIDVerificationStatus.HideVerifyDialog

        // Whether verified in next id server
        const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
        if (!platform) return NextIDVerificationStatus.Other

        const isBound = await NextIDProof.queryIsBound(currentPersona.identifier.publicKeyAsHex, platform, username)
        if (isBound) return NextIDVerificationStatus.Verified

        if (isOpenedFromButton && !disableInitialVerify) {
            verifyPersona(personaConnectStatus.currentPersona?.identifier)()
        }
        isOpenedVerifyDialog = true
        isOpenedFromButton = false
        return NextIDVerificationStatus.WaitingVerify
    }, [username, isOpenedVerifyDialog, personaConnectStatus, currentPersonaIdentifier.value, disableInitialVerify])

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
                ? verifyPersona(personaConnectStatus.currentPersona?.identifier, lastState.username)
                : null,
    }
}
