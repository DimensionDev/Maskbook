import { DialogContent } from '@mui/material'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ConnectionContent } from './ConnectionContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConnectionDialogProps {}

export function ConnectionDialog(props: ConnectionDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
    return (
        <InjectedDialog title="Connection" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <DefaultWeb3ContextProvider>
                    <ConnectionContent onClose={closeDialog} />
                </DefaultWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
