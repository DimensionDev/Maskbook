import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId } from '@masknet/web3-shared-evm'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { WidgetContent } from './WidgetContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export function WidgetDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.widgetDialogUpdated)
    return (
        <InjectedDialog title="Widgets" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <EVMWeb3ContextProvider chainId={ChainId.Mainnet}>
                    <WidgetContent onClose={closeDialog} />
                </EVMWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
