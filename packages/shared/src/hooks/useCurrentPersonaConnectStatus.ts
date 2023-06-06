import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import { useSharedI18N } from '../index.js'
import type { PersonaConnectStatus } from '../types.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    CrossIsolationMessages,
    DashboardRoutes,
    type MaskEvents,
    type PersonaInformation,
    isSamePersona,
    isSameProfile,
    resolveNextIDIdentityToProfile,
} from '@masknet/shared-base'
import { useCallback, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

const DEFAULT_PERSONA_CONNECT_STATUS: PersonaConnectStatus = {
    action: undefined,
    currentPersona: undefined,
    connected: false,
    hasPersona: false,
    verified: false,
    proof: undefined,
}

export function useCurrentPersonaConnectStatus(
    personas: PersonaInformation[],
    currentPersonaIdentifier?: string,
    openDashboard?: (route?: DashboardRoutes, search?: string) => Promise<any>,
    identity?: IdentityResolved,
    message?: WebExtensionMessage<MaskEvents>,
) {
    const t = useSharedI18N()

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )
    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.openPageConfirm,
    )

    const create = useCallback(
        (target?: string, position?: 'center' | 'top-right', _?: boolean, direct = false) => {
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

    const {
        value = DEFAULT_PERSONA_CONNECT_STATUS,
        loading,
        error,
        retry,
    } = useAsyncRetry<PersonaConnectStatus>(async () => {
        const currentPersona = personas.find((x) => isSamePersona(x, currentPersonaIdentifier))
        const currentProfile = currentPersona?.linkedProfiles.find((x) =>
            isSameProfile(x.identifier, identity?.identifier),
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
            const nextIDInfo = await NextIDProof.queryExistedBindingByPersona(currentPersona.identifier.publicKeyAsHex)
            const verifiedProfile = nextIDInfo?.proofs.find(
                (x) =>
                    isSameProfile(resolveNextIDIdentityToProfile(x.identity, x.platform), currentProfile.identifier) &&
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
    }, [
        currentPersonaIdentifier,
        personas,
        identity?.identifier?.toText(),
        create,
        openPersonListDialog,
        openDashboard,
    ])

    useEffect(() => message?.events.ownPersonaChanged.on(retry), [retry, message?.events.ownPersonaChanged])

    useEffect(() => {
        return message?.events.ownProofChanged.on(() => {
            retry()
        })
    }, [message?.events.ownPersonaChanged, retry])

    return { value, loading, retry, error }
}
