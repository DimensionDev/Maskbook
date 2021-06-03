import type { Plugin } from '@dimensiondev/mask-plugin-infra/src'
import { usePortalShadowRoot } from '@dimensiondev/maskbook-shared'
import { MaskDialog } from '@dimensiondev/maskbook-theme'
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
