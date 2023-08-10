import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ConsoleContent } from './ConsoleContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConsoleDialogProps {}

export function ConsoleDialog(props: ConsoleDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                    <ConsoleContent onClose={closeDialog} />
                </Web3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
