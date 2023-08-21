import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId } from '@masknet/web3-shared-evm'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { WidgetContent } from './WidgetContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface WidgetDialogProps {}

export function WidgetDialog(props: WidgetDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.widgetDialogUpdated)
    return (
        <InjectedDialog title="Widgets" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <DefaultWeb3ContextProvider value={{ chainId: ChainId.Mainnet }}>
                    <WidgetContent onClose={closeDialog} />
                </DefaultWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
