import { DialogContent } from '@mui/material'
import { InjectedDialog, useRemoteControlledDialog } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { SNSAdaptorPluginContext } from '@masknet/web3-providers'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ConsoleContent } from './ConsoleContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConsoleDialogProps {}

export function ConsoleDialog(props: ConsoleDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)

    if (!SNSAdaptorPluginContext.context) return null
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
