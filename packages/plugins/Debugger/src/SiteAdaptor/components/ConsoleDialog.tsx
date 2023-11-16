import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ConsoleContent } from './ConsoleContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export function ConsoleDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <EVMWeb3ContextProvider>
                    <ConsoleContent onClose={closeDialog} />
                </EVMWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
