import { PluginId } from '@masknet/plugin-infra/content-script'
import { PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCurrentPersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { useI18N } from '../locales'
import { BindDialog } from './BindDialog'
import { PluginEnableBoundary } from '../../../components/shared/PluginEnableBoundary'
import {
    AddWalletPersonaAction,
    CreatePersonaAction,
    OtherLackWalletAction,
    SelectConnectPersonaAction,
} from './Actions'
import { PluginCardFrameMini } from '@masknet/shared'

export function NextIdPage() {
    const t = useI18N()

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

        return (
            <PluginEnableBoundary pluginId={PluginId.Web3Profile}>
                {(() => {
                    if (!personaConnectStatus.hasPersona)
                        return (
                            <CreatePersonaAction
                                disabled={statusLoading}
                                onCreate={() => personaConnectStatus.action?.()}
                            />
                        )
                    if (!personaConnectStatus.connected || !personaConnectStatus.verified)
                        return <SelectConnectPersonaAction />

                    return <AddWalletPersonaAction disabled={statusLoading} onAddWallet={handleAddWallets} />
                })()}
            </PluginEnableBoundary>
        )
    }, [isOwn, t, statusLoading, handleAddWallets])

    if (loadingBindings || loadingPersona) {
        return <PluginCardFrameMini />
    }

    return (
        <>
            <PluginCardFrameMini>{getActionComponent}</PluginCardFrameMini>
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
