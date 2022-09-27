import { PluginID } from '@masknet/plugin-infra/content-script'
import { PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI.js'
import { useCurrentPersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus.js'
import Services from '../../../extension/service.js'
import { useI18N } from '../locales/index.js'
import { BindDialog } from './BindDialog.js'
import { PluginEnableBoundary } from '../../../components/shared/PluginEnableBoundary.js'
import {
    AddWalletPersonaAction,
    CreatePersonaAction,
    OtherLackWalletAction,
    SelectConnectPersonaAction,
} from './Actions/index.js'
import { PluginCardFrameMini } from '@masknet/shared'
import { ThemeProvider } from '@mui/material'
import { makeStyles, MaskLightTheme } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    enablePluginRoot: {
        marginTop: 80,
    },
}))

export function NextIdPage() {
    const t = useI18N()
    const { classes } = useStyles()

    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const { value: personaConnectStatus, loading: statusLoading } = useCurrentPersonaConnectStatus()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex

    const {
        value: bindings,
        loading: loadingBindings,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!publicKeyAsHex) return
        return NextIDProof.queryExistedBindingByPersona(publicKeyAsHex)
    }, [publicKeyAsHex])

    const handleAddWallets = () => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            internal: true,
        })
    }

    const getActionComponent = useMemo(() => {
        if (!isOwn) return <OtherLackWalletAction />

        if (!personaConnectStatus.hasPersona || !personaConnectStatus.connected || !personaConnectStatus.verified) {
            return (
                <PluginEnableBoundary pluginId={PluginID.Web3Profile} classes={{ root: classes.enablePluginRoot }}>
                    {(() => {
                        if (!personaConnectStatus.hasPersona)
                            return (
                                <CreatePersonaAction
                                    disabled={statusLoading}
                                    onCreate={() =>
                                        personaConnectStatus.action?.(undefined, undefined, undefined, true)
                                    }
                                />
                            )
                        if (!personaConnectStatus.connected || !personaConnectStatus.verified)
                            return <SelectConnectPersonaAction />

                        return <AddWalletPersonaAction disabled={statusLoading} onAddWallet={handleAddWallets} />
                    })()}
                </PluginEnableBoundary>
            )
        }

        return <AddWalletPersonaAction disabled={statusLoading} onAddWallet={handleAddWallets} />
    }, [isOwn, t, statusLoading, handleAddWallets, personaConnectStatus])

    if (loadingBindings || loadingPersona) {
        return <PluginCardFrameMini />
    }

    return (
        <>
            <PluginCardFrameMini>
                <ThemeProvider theme={MaskLightTheme}>{getActionComponent}</ThemeProvider>
            </PluginCardFrameMini>
            {openBindDialog && currentPersona && isOwn && (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={bindings?.proofs ?? EMPTY_LIST}
                    onBound={retryQueryBinding}
                />
            )}
        </>
    )
}
