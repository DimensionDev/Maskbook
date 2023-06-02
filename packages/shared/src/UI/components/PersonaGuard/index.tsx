import { memo, useEffect, type PropsWithChildren, useCallback } from 'react'
import { useCurrentPersonaConnectStatus } from '../../../hooks/useCurrentPersonaConnectStatus.js'
import {
    CrossIsolationMessages,
    type PersonaInformation,
    type PersonaSelectPanelDialogEvent,
} from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'

interface Props {
    personas: PersonaInformation[]
    currentPersonaIdentifier?: string
    identity?: IdentityResolved
    onDiscard?: () => void
}

export const PersonaGuard = memo(function PersonaGuard({
    children,
    personas,
    currentPersonaIdentifier,
    identity,
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
    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
        handleEvent,
    )

    useEffect(() => {
        if (loading) return
        if (!connectedAndVerified) {
            setPersonaSelectPanelDialog({
                open: true,
                enableVerify: true,
            })
        }
    }, [loading, connectedAndVerified])

    if (loading || !connectedAndVerified) return null
    if (!status.connected) return null

    return <>{children}</>
})
