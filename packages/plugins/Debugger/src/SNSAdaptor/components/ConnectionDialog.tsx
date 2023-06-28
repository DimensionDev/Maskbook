import { DialogContent } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { InjectedDialog, useRemoteControlledDialog } from '@masknet/shared'
import { ConnectionContent } from './ConnectionContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConnectionDialogProps {}

export function ConnectionDialog(props: ConnectionDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
    return (
        <InjectedDialog title="Connection" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                    <ConnectionContent onClose={closeDialog} />
                </Web3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
