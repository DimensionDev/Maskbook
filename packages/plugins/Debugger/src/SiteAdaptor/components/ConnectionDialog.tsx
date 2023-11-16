import { DialogContent } from '@mui/material'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ConnectionContent } from './ConnectionContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export function ConnectionDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
    return (
        <InjectedDialog title="Connection" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <EVMWeb3ContextProvider>
                    <ConnectionContent onClose={closeDialog} />
                </EVMWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
