import { useCallback, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { PluginID, PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI.js'
import { PluginCardFrameMini, useCurrentPersonaConnectStatus, usePersonaProofs } from '@masknet/shared'
import Services from '../../../extension/service.js'
import { BindDialog } from './BindDialog.js'
import { PluginEnableBoundary } from '../../../components/shared/PluginEnableBoundary.js'
import {
    AddWalletPersonaAction,
    CreatePersonaAction,
    OtherLackWalletAction,
    SelectConnectPersonaAction,
} from './Actions/index.js'

import { ThemeProvider } from '@mui/material'
import { MaskLightTheme } from '@masknet/theme'
import { MaskMessages } from '../../../utils/messages.js'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { currentPersonaIdentifier } from '../../../../shared/legacy-settings/settings.js'
import { useValueRef } from '@masknet/shared-base-ui'

export function NextIdPage() {
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const allPersonas = useAllPersonas()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personaConnectStatus, loading: statusLoading } = useCurrentPersonaConnectStatus(
        allPersonas,
        currentIdentifier,
        Services.Helper.openDashboard,
        currentProfileIdentifier,
        MaskMessages,
    )

    const [openBindDialog, toggleBindDialog] = useState(false)
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex
    const proofs = usePersonaProofs(publicKeyAsHex, MaskMessages)

    const handleAddWallets = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            internal: true,
        })
    }, [])

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

    if (proofs.loading || loadingPersona) {
        return <PluginCardFrameMini />
    }

    return (
        <>
            <PluginCardFrameMini>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginEnableBoundary pluginID={PluginID.Web3Profile}>{getActionComponent}</PluginEnableBoundary>
                </ThemeProvider>
            </PluginCardFrameMini>
            {openBindDialog && currentPersona && isOwn && (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={proofs.value ?? EMPTY_LIST}
                    onBound={proofs.retry}
                />
            )}
        </>
    )
}
