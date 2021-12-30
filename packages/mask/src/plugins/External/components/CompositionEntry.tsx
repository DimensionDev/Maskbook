import type { Plugin } from '@masknet/plugin-infra'
import { usePortalShadowRoot } from '@masknet/theme'
import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useEffect } from 'react'
import { MaskMessages, useI18N } from '../../../utils'
import { PluginLoader } from './PluginLoader'

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
        <MaskDialog
            open={props.open}
            title={t('plugin_external_entry_title')}
            onClose={props.onClose}
            DialogProps={{ container }}>
            <DialogContent sx={{ minHeight: 200, minWidth: 400 }}>
                <PluginLoader />
            </DialogContent>
        </MaskDialog>
    ))
}
