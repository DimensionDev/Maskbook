import { memo, type PropsWithChildren, useCallback, useLayoutEffect } from 'react'
import {
    CrossIsolationMessages,
    type PersonaInformation,
    type PersonaSelectPanelDialogEvent,
} from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useCurrentPersonaConnectStatus } from '../../../hooks/useCurrentPersonaConnectStatus.js'

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

    useLayoutEffect(() => {
        if (connectedAndVerified || loading) {
            closeDialog()
            return
        }
        setPersonaSelectPanelDialog({
            open: true,
            enableVerify: true,
            target: forwardTarget,
        })
    }, [loading, connectedAndVerified, forwardTarget])

    if (loading || !connectedAndVerified) return null

    return <>{children}</>
})
