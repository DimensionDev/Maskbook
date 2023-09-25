import { useEffect } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { usePortalShadowRoot } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { PluginLoader } from './PluginLoader.js'
import { InjectedDialog } from '@masknet/shared'
import { MaskMessages } from '@masknet/shared-base'
import { useExternalTrans } from '../locales/index.js'

export function ThirdPartyPluginCompositionEntry(props: Plugin.SiteAdaptor.CompositionDialogEntry_DialogProps) {
    const t = useExternalTrans()
    useEffect(
        () =>
            MaskMessages.events.replaceComposition.on(() => {
                props.onClose()
            }),
        [props.onClose],
    )
    return usePortalShadowRoot((container) => (
        <InjectedDialog
            open={props.open}
            title={t.plugin_external_entry_title()}
            onClose={props.onClose}
            container={container}>
            <DialogContent sx={{ minHeight: 200, minWidth: 400 }}>
                <PluginLoader />
            </DialogContent>
        </InjectedDialog>
    ))
}
