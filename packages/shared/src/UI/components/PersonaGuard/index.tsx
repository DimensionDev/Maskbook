import { memo, type PropsWithChildren, useLayoutEffect, useEffect } from 'react'
import { type PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { useCurrentPersonaConnectStatus } from '../../../hooks/useCurrentPersonaConnectStatus.js'
import { PersonaSelectPanelModal } from '../../modals/index.js'

interface Props {
    personas: PersonaInformation[]
    currentPersonaIdentifier?: string
    identity?: IdentityResolved
    onDiscard?: () => void
    /** The target that will be opened after connected */
    forwardTarget?: string
}

/**
 * TODO
 * Unused, but could be used to refactor as guardian of persona requirement
 */
export const PersonaGuard = memo(function PersonaGuard({
    children,
    personas,
    currentPersonaIdentifier,
    identity,
    forwardTarget,
    onDiscard,
}: PropsWithChildren<Props>) {
    const { value: status, loading } = useCurrentPersonaConnectStatus(
        personas,
        currentPersonaIdentifier,
        undefined,
        identity,
    )

    const connectedAndVerified = status.connected && status.verified
    /*
    const handleEvent = useCallback(
        (event: PersonaSelectPanelDialogEvent) => {
            if (!event.open && !connectedAndVerified) {
                onDiscard?.()
            }
        },
        [connectedAndVerified, onDiscard],
    )
    const { setDialog: setPersonaSelectPanelDialog, closeDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
        handleEvent,
    )
    */

    useEffect(() => {
        PersonaSelectPanelModal.emitter.on('close', () => {
            if (!connectedAndVerified) {
                onDiscard?.()
            }
        })
    }, [connectedAndVerified])

    useLayoutEffect(() => {
        if (connectedAndVerified || loading) {
            PersonaSelectPanelModal.close()
            return
        }
        PersonaSelectPanelModal.open({
            enableVerify: true,
            target: forwardTarget,
        })
    }, [loading, connectedAndVerified, forwardTarget])

    if (loading || !connectedAndVerified) return null

    return <>{children}</>
})
