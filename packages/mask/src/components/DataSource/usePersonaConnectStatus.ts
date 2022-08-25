import { useCallback, useEffect, useMemo } from 'react'
import stringify from 'json-stable-stringify'
import {
    DashboardRoutes,
    isSamePersona,
    isSameProfile,
    nextIDIdentityToProfile,
    BindingProof,
    PersonaInformation,
} from '@masknet/shared-base'
import Services from '../../extension/service'
import { currentPersonaIdentifier, currentSetupGuideStatus } from '../../../shared/legacy-settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../../../shared/legacy-settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { usePersonasFromDB } from './usePersonasFromDB'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { useAsync, useAsyncRetry } from 'react-use'
import { PluginNextIDMessages } from '../../plugins/NextID/messages'
import { NextIDProof } from '@masknet/web3-providers'
import { MaskMessages, useI18N } from '../../utils'

const createPersona = () => {
    Services.Helper.openDashboard(DashboardRoutes.Setup)
}

const connectPersona = async () => {
    const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
    currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
        status: SetupGuideStep.FindUsername,
        persona: currentPersonaIdentifier?.toText(),
    })
}

/**
 * @deprecated Should use useCurrentPersonaConnectStatus
 * We are fixing the current persona logic on SNS
 */
export function usePersonaConnectStatus() {
    const personas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()

    return useMemo(() => {
        const id = lastRecognized.identifier
        const currentPersona = personas.find((x) => id && x.linkedProfiles.some((x) => x.identifier === id))
        return {
            action: !personas.length ? createPersona : !currentPersona ? connectPersona : undefined,
            currentPersona,
            connected: !!currentPersona,
            hasPersona: !!personas.length,
        }
    }, [personas, lastRecognized.identifier?.toText(), activatedSocialNetworkUI])
}

/**
 * Get current setting persona
 */
export function useCurrentPersona() {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { value } = useAsync(async () => {
        const identifier = await Services.Settings.getCurrentPersonaIdentifier()

        if (!identifier) return
        return Services.Identity.queryPersona(identifier)
    }, [currentIdentifier])

    return value
}

export interface PersonaConnectStatus {
    action?: (target?: string | undefined, position?: 'center' | 'top-right' | undefined) => void
    currentPersona?: PersonaInformation
    connected?: boolean
    hasPersona?: boolean
    verified?: boolean
    proof?: BindingProof[]
}

const defaultStatus: PersonaConnectStatus = {
    action: undefined,
    currentPersona: undefined,
    connected: false,
    hasPersona: false,
    verified: false,
    proof: undefined,
}

export function useCurrentPersonaConnectStatus() {
    const { t } = useI18N()

    const personas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { setDialog: setPersonaListDialog } = useRemoteControlledDialog(PluginNextIDMessages.PersonaListDialogUpdated)
    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(MaskMessages.events.openPageConfirm)

    const create = useCallback(
        (target?: string, position?: 'center' | 'top-right') => {
            setCreatePersonaConfirmDialog({
                open: true,
                target: 'dashboard',
                url: target ?? DashboardRoutes.Setup,
                text: t('applications_create_persona_hint'),
                title: t('applications_create_persona_title'),
                actionHint: t('applications_create_persona_action'),
                position,
            })
        },
        [setCreatePersonaConfirmDialog],
    )

    const openPersonListDialog = useCallback(
        (target?: string, position?: 'center' | 'top-right') => {
            setPersonaListDialog({
                open: true,
                target,
                position,
            })
        },
        [setPersonaListDialog],
    )

    const {
        value = defaultStatus,
        loading,
        retry,
    } = useAsyncRetry<PersonaConnectStatus>(async () => {
        const currentPersona = personas.find((x) => isSamePersona(x, currentIdentifier))
        const currentProfile = currentPersona?.linkedProfiles.find((x) =>
            isSameProfile(x.identifier, lastRecognized.identifier),
        )

        // handle not have persona
        if (!currentPersona || !personas.length) {
            return {
                action: create,
                currentPersona: undefined,
                connected: false,
                hasPersona: false,
            }
        }

        // handle had persona but not connect current sns
        if (!currentProfile) {
            return {
                action: openPersonListDialog,
                currentPersona,
                connected: false,
                hasPersona: true,
            }
        }

        // handle had persona and connected current sns, then check the nextID
        try {
            const nextIDInfo = await NextIDProof.queryExistedBindingByPersona(
                currentPersona?.identifier.publicKeyAsHex,
                false,
            )
            const verifiedProfile = nextIDInfo?.proofs.find(
                (x) =>
                    // TODO: should move to next id api center, link the MF-1845
                    isSameProfile(nextIDIdentityToProfile(x.identity, x.platform), currentProfile?.identifier) &&
                    x.is_valid,
            )

            return {
                action: verifiedProfile ? undefined : openPersonListDialog,
                currentPersona,
                connected: true,
                hasPersona: true,
                verified: !!verifiedProfile,
                proof: nextIDInfo?.proofs,
            }
        } catch {
            return {
                action: openPersonListDialog,
                currentPersona,
                connected: false,
                hasPersona: true,
            }
        }
    }, [
        currentIdentifier,
        personas,
        lastRecognized.identifier?.toText(),
        activatedSocialNetworkUI,
        create,
        openPersonListDialog,
    ])

    useEffect(() => MaskMessages.events.ownProofChanged.on(retry), [retry])
    return { value, loading, retry }
}
