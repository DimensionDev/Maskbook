import type { Plugin } from '@masknet/plugin-infra'
import { usePortalShadowRoot } from '@masknet/shared'
import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { PluginLoader } from './PluginLoader'

export function ThirdPartyPluginCompositionEntry(props: Plugin.SNSAdaptor.CompositionDialogEntry_DialogProps) {
    return usePortalShadowRoot((container) => (
        <MaskDialog
            open={props.open}
            title="🧩 Use third party plugins"
            onClose={props.onClose}
            DialogProps={{ container }}>
            <DialogContent>
                <PluginLoader />
            </DialogContent>
        </MaskDialog>
    ))
}
