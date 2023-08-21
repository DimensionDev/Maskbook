import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ConsoleContent } from './ConsoleContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConsoleDialogProps {}

export function ConsoleDialog(props: ConsoleDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <DefaultWeb3ContextProvider>
                    <ConsoleContent onClose={closeDialog} />
                </DefaultWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
