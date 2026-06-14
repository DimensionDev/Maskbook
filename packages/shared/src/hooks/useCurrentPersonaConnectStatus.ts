import { useCallback, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import {
    DashboardRoutes,
    type PersonaInformation,
    isSamePersona,
    isSameProfile,
    MaskMessages,
    type ECKeyIdentifier,
} from '@masknet/shared-base'
import { LeavePageConfirmModal, PersonaSelectPanelModal } from '../UI/modals/index.js'
import type { PersonaConnectStatus } from '../types.js'
import { useLingui } from '@lingui/react/macro'

const DEFAULT_PERSONA_CONNECT_STATUS: PersonaConnectStatus = {
    action: undefined,
    currentPersona: undefined,
    connected: false,
    hasPersona: false,
}

export function useCurrentPersonaConnectStatus(
    personas: readonly PersonaInformation[],
    currentPersonaIdentifier?: ECKeyIdentifier,
    openDashboard?: (route: DashboardRoutes, search?: string) => void,
    identity?: IdentityResolved,
) {
    const { t } = useLingui()
    const create = useCallback((target?: string, position?: 'center' | 'top-right', _2?: boolean, direct = false) => {
        if (direct) {
            openDashboard?.(DashboardRoutes.SignUpPersona)
        } else {
            LeavePageConfirmModal.open({
                openDashboard,
                info: {
                    target: 'dashboard',
                    url: target ?? DashboardRoutes.SignUpPersona,
                    text: t`Please create a Persona and verify your account to use this.`,
                    title: t`Persona`,
                    actionHint: t`Create persona`,
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

        // handle had persona and connected current site
        return {
            action: undefined,
            currentPersona,
            connected: true,
            hasPersona: true,
        }
    }, [currentPersonaIdentifier, personas, identity?.identifier, create, openPersonListDialog])

    useEffect(() => {
        const cleanPersonaChangedListener = MaskMessages.events.ownPersonaChanged.on(retry)
        return () => {
            cleanPersonaChangedListener()
        }
    }, [retry])

    return { value, loading, retry, error }
}
