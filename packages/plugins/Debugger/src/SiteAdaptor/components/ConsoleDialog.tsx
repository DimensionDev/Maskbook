import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ConsoleContent } from './ConsoleContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export function ConsoleDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <ConsoleContent onClose={closeDialog} />
            </DialogContent>
        </InjectedDialog>
    )
}
