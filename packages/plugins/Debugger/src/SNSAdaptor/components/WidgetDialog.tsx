import { DialogContent } from '@mui/material'
import { InjectedDialog, useRemoteControlledDialog } from '@masknet/shared'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { WidgetContent } from './WidgetContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface WidgetDialogProps {}

export function WidgetDialog(props: WidgetDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.widgetDialogUpdated)
    return (
        <InjectedDialog title="Widgets" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
                    <WidgetContent onClose={closeDialog} />
                </Web3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
