import {
    BindingProof,
    CrossIsolationMessages,
    DashboardRoutes,
    PersonaInformation,
    isSamePersona,
    isSameProfile,
    resolveNextIDIdentityToProfile,
} from '@masknet/shared-base'
import { useSharedI18N } from '../index.js'
import { useAllPersonas, useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { useCallback, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'

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
    const t = useSharedI18N()
    const { currentPersonaIdentifier, MaskMessages, openDashboard } = useSNSAdaptorContext()
    const personas = useAllPersonas()
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
                openDashboard(DashboardRoutes.Setup)
            } else {
                setCreatePersonaConfirmDialog({
                    open: true,
                    target: 'dashboard',
                    url: target ?? DashboardRoutes.Setup,
                    text: t.applications_create_persona_hint(),
                    title: t.applications_create_persona_title(),
                    actionHint: t.applications_create_persona_action(),
                    position,
                })
            }
        },
        [setCreatePersonaConfirmDialog, openDashboard],
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

    const {
        value = defaultStatus,
        loading,
        error,
        retry,
    } = useAsyncRetry<PersonaConnectStatus>(async () => {
        const currentPersona = personas.find((x) => isSamePersona(x, currentIdentifier))
        const currentProfile = currentPersona?.linkedProfiles.find((x) =>
            isSameProfile(x.identifier, lastRecognized?.identifier),
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
                    isSameProfile(resolveNextIDIdentityToProfile(x.identity, x.platform), currentProfile?.identifier) &&
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
                connected: true,
                hasPersona: true,
            }
        }
    }, [currentIdentifier, personas, lastRecognized?.identifier?.toText(), create, openPersonListDialog])

    useEffect(() => MaskMessages.events.ownProofChanged.on(retry), [retry])
    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    return { value, loading, retry, error }
}
