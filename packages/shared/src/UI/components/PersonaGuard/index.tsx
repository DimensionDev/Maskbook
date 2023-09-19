import { memo, type PropsWithChildren, useLayoutEffect, useEffect } from 'react'
import { type PersonaIdentifier, type PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { useCurrentPersonaConnectStatus } from '../../../hooks/useCurrentPersonaConnectStatus.js'
import { PersonaSelectPanelModal } from '../../modals/index.js'

interface Props {
    personas: PersonaInformation[]
    currentPersonaIdentifier?: PersonaIdentifier
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

    useEffect(() => {
        const off = PersonaSelectPanelModal.emitter.on('close', () => {
            if (!connectedAndVerified) {
                onDiscard?.()
            }
        })
        return () => {
            off()
        }
    }, [connectedAndVerified])

    useLayoutEffect(() => {
        if (connectedAndVerified || loading) {
            PersonaSelectPanelModal.close()
            return
        }
        PersonaSelectPanelModal.open({
            enableVerify: true,
            finishTarget: forwardTarget,
        })
    }, [loading, connectedAndVerified, forwardTarget])

    if (loading || !connectedAndVerified) return null

    return <>{children}</>
})
