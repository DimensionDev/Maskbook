import type { Plugin } from '@masknet/plugin-infra'
import { usePortalShadowRoot } from '@masknet/theme'
import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { useEffect } from 'react'
import { MaskMessages } from '../../../utils'
import { PluginLoader } from './PluginLoader'

export function ThirdPartyPluginCompositionEntry(props: Plugin.SNSAdaptor.CompositionDialogEntry_DialogProps) {
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
            title="🧩 Load external plugins (Nightly feature)"
            onClose={props.onClose}
            DialogProps={{ container }}>
            <DialogContent sx={{ minHeight: 200, minWidth: 400 }}>
                <PluginLoader />
            </DialogContent>
        </MaskDialog>
    ))
}
