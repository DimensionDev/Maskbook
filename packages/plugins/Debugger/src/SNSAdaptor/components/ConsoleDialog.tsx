import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ConsoleContent } from './ConsoleContent'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks'
import { PluginDebuggerMessages } from '../../messages'

export interface ConsoleDialogProps {}

export function ConsoleDialog(props: ConsoleDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <ConsoleContent onClose={closeDialog} />
            </DialogContent>
        </InjectedDialog>
    )
}
