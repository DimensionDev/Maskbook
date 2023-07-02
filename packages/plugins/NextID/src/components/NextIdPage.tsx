import { memo, useCallback, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { ThemeProvider } from '@mui/material'
import { MaskLightTheme } from '@masknet/theme'
import {
    useAllPersonas,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'
import {
    PluginCardFrameMini,
    useCurrentPersonaConnectStatus,
    usePersonaProofs,
    PluginEnableBoundary,
} from '@masknet/shared'
import { PluginID, PopupRoutes, EMPTY_LIST, currentPersonaIdentifier, MaskMessages } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { BindDialog } from './BindDialog.js'
import {
    AddWalletPersonaAction,
    CreatePersonaAction,
    OtherLackWalletAction,
    SelectConnectPersonaAction,
} from './Actions/index.js'

export const NextIdPage = memo(function NextIdPage() {
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const allPersonas = useAllPersonas()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { openDashboard, queryPersonaByProfile, openPopupWindow } = useSNSAdaptorContext()

    const { value: personaConnectStatus, loading: statusLoading } = useCurrentPersonaConnectStatus(
        allPersonas,
        currentIdentifier,
        openDashboard,
        currentProfileIdentifier,
        MaskMessages,
    )

    const [openBindDialog, toggleBindDialog] = useState(false)
    const isOwn =
        currentProfileIdentifier &&
        currentProfileIdentifier?.identifier?.userId === visitingPersonaIdentifier?.identifier?.userId

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return queryPersonaByProfile?.(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier?.identifier, personaConnectStatus.hasPersona, queryPersonaByProfile])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex
    const proofs = usePersonaProofs(publicKeyAsHex, MaskMessages)

    const handleAddWallets = useCallback(() => {
        openPopupWindow?.(PopupRoutes.ConnectedWallets, {
            internal: true,
        })
    }, [openPopupWindow])

    const getActionComponent = useMemo(() => {
        if (!isOwn) return <OtherLackWalletAction />

        if (!personaConnectStatus.hasPersona || !personaConnectStatus.connected || !personaConnectStatus.verified) {
            if (!personaConnectStatus.hasPersona)
                return (
                    <CreatePersonaAction
                        disabled={statusLoading}
                        onCreate={() => personaConnectStatus.action?.(undefined, undefined, undefined, true)}
                    />
                )
            if (!personaConnectStatus.connected || !personaConnectStatus.verified) return <SelectConnectPersonaAction />

            return <AddWalletPersonaAction disabled={statusLoading} onAddWallet={handleAddWallets} />
        }

        return <AddWalletPersonaAction disabled={statusLoading} onAddWallet={handleAddWallets} />
    }, [isOwn, statusLoading, handleAddWallets, personaConnectStatus])

    if ((!proofs.data && proofs.isFetching) || loadingPersona) {
        return <PluginCardFrameMini />
    }

    return (
        <>
            <PluginCardFrameMini>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginEnableBoundary pluginID={PluginID.Web3Profile}>{getActionComponent}</PluginEnableBoundary>
                </ThemeProvider>
            </PluginCardFrameMini>
            {openBindDialog && currentPersona && isOwn ? (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={proofs.data ?? EMPTY_LIST}
                    onBound={proofs.refetch}
                />
            ) : null}
        </>
    )
})
