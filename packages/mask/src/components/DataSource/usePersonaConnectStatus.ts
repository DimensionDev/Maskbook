import { useCallback, useEffect, useMemo } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import stringify from 'json-stable-stringify'
import {
    DashboardRoutes,
    isSamePersona,
    isSameProfile,
    BindingProof,
    PersonaInformation,
    resolveNextIDIdentityToProfile,
    CrossIsolationMessages,
} from '@masknet/shared-base'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { usePersonaProofs } from '@masknet/shared'
import Services from '../../extension/service.js'
import { currentPersonaIdentifier, currentSetupGuideStatus } from '../../../shared/legacy-settings/settings.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { SetupGuideStep } from '../../../shared/legacy-settings/types.js'
import { useLastRecognizedIdentity } from './useActivatedUI.js'
import { usePersonasFromDB } from './usePersonasFromDB.js'
import { MaskMessages, useI18N } from '../../utils/index.js'

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
    action?: (
        target?: string | undefined,
        position?: 'center' | 'top-right' | undefined,
        enableVerify?: boolean,
        direct?: boolean,
    ) => void
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

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )
    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.openPageConfirm,
    )

    const create = useCallback(
        (target?: string, position?: 'center' | 'top-right', enableVerify?: boolean, direct = false) => {
            if (direct) {
                Services.Helper.openDashboard(DashboardRoutes.Setup)
            } else {
                setCreatePersonaConfirmDialog({
                    open: true,
                    target: 'dashboard',
                    url: target ?? DashboardRoutes.Setup,
                    text: t('applications_create_persona_hint'),
                    title: t('applications_create_persona_title'),
                    actionHint: t('applications_create_persona_action'),
                    position,
                })
            }
        },
        [setCreatePersonaConfirmDialog],
    )

    const openPersonListDialog = useCallback(
        (target?: string, position?: 'center' | 'top-right', enableVerify = true) => {
            setPersonaSelectPanelDialog({
                open: true,
                target,
                position,
                enableVerify,
            })
        },
        [setPersonaSelectPanelDialog],
    )

    const currentPersona = useMemo(
        () => personas.find((x) => isSamePersona(x, currentIdentifier)),
        [currentIdentifier, personas],
    )

    const { value: proofs } = usePersonaProofs(currentPersona?.identifier.publicKeyAsHex, MaskMessages)

    const {
        value = defaultStatus,
        loading,
        error,
        retry,
    } = useAsyncRetry<PersonaConnectStatus>(async () => {
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
            const verifiedProfile = proofs?.find(
                (x) =>
                    isSameProfile(resolveNextIDIdentityToProfile(x.identity, x.platform), currentProfile?.identifier) &&
                    x.is_valid,
            )

            return {
                action: verifiedProfile ? undefined : openPersonListDialog,
                currentPersona,
                connected: true,
                hasPersona: true,
                verified: !!verifiedProfile,
                proof: proofs,
            }
        } catch {
            return {
                action: openPersonListDialog,
                currentPersona,
                connected: true,
                hasPersona: true,
            }
        }
    }, [
        currentPersona,
        lastRecognized.identifier?.toText(),
        activatedSocialNetworkUI,
        create,
        openPersonListDialog,
        proofs?.length,
    ])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    return { value, loading, retry, error }
}
