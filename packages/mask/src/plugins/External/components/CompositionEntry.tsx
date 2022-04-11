import type { Plugin } from '@masknet/plugin-infra'
import { usePortalShadowRoot } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useEffect } from 'react'
import { MaskMessages, useI18N } from '../../../utils'
import { PluginLoader } from './PluginLoader'
import { InjectedDialog } from '@masknet/shared'

export function ThirdPartyPluginCompositionEntry(props: Plugin.SNSAdaptor.CompositionDialogEntry_DialogProps) {
    const { t } = useI18N()
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
            title={t('plugin_external_entry_title')}
            onClose={props.onClose}
            container={container}>
            <DialogContent sx={{ minHeight: 200, minWidth: 400 }}>
                <PluginLoader />
            </DialogContent>
        </InjectedDialog>
    ))
}
