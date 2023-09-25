import { useCallback, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import {
    DashboardRoutes,
    type PersonaInformation,
    isSamePersona,
    isSameProfile,
    resolveNextIDIdentityToProfile,
    MaskMessages,
    type ECKeyIdentifier,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { LeavePageConfirmModal, PersonaSelectPanelModal } from '../UI/modals/index.js'
import { useSharedTrans } from '../locales/index.js'
import type { PersonaConnectStatus } from '../types.js'

const DEFAULT_PERSONA_CONNECT_STATUS: PersonaConnectStatus = {
    action: undefined,
    currentPersona: undefined,
    connected: false,
    hasPersona: false,
    verified: false,
    proof: undefined,
}

export function useCurrentPersonaConnectStatus(
    personas: readonly PersonaInformation[],
    currentPersonaIdentifier?: ECKeyIdentifier,
    openDashboard?: (route?: DashboardRoutes, search?: string) => void,
    identity?: IdentityResolved,
) {
    const t = useSharedTrans()

    const create = useCallback((target?: string, position?: 'center' | 'top-right', _?: boolean, direct = false) => {
        if (direct) {
            openDashboard?.(DashboardRoutes.SignUpPersona)
        } else {
            LeavePageConfirmModal.open({
                openDashboard,
                info: {
                    target: 'dashboard',
                    url: target ?? DashboardRoutes.SignUpPersona,
                    text: t.applications_create_persona_hint(),
                    title: t.applications_create_persona_title(),
                    actionHint: t.applications_create_persona_action(),
                    position,
                },
            })
        }
    }, [])

    const openPersonListDialog = useCallback(
        (finishTarget?: string, position?: 'center' | 'top-right', enableVerify = true) => {
            PersonaSelectPanelModal.open({
                finishTarget,
                position,
                enableVerify,
            })
        },
        [],
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

        // handle had persona but not connect current site
        if (!currentProfile) {
            return {
                action: openPersonListDialog,
                currentPersona,
                connected: false,
                hasPersona: true,
            }
        }

        // handle had persona and connected current site, then check the nextID
        try {
            const nextIDInfo = await NextIDProof.queryExistedBindingByPersona(currentPersona.identifier.publicKeyAsHex)
            const verifiedProfile = nextIDInfo?.proofs.find(
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
    }, [currentPersonaIdentifier, personas, identity?.identifier, create, openPersonListDialog])

    useEffect(() => {
        const cleanPersonaChangedListener = MaskMessages.events.ownPersonaChanged.on(retry)
        const cleanProofsChangedListener = MaskMessages.events.ownProofChanged.on(retry)
        return () => {
            cleanPersonaChangedListener()
            cleanProofsChangedListener()
        }
    }, [retry])

    return { value, loading, retry, error }
}
