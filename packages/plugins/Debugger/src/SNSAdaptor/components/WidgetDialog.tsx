import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkContextProvider, ChainContextProvider } from '@masknet/web3-hooks-base'
import { WidgetContent } from './WidgetContent.js'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks/index.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface WidgetDialogProps {}

export function WidgetDialog(props: WidgetDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.widgetDialogUpdated)
    return (
        <InjectedDialog title="Widgets" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <ChainContextProvider
                        value={{
                            chainId: ChainId.Mainnet,
                        }}>
                        <WidgetContent onClose={closeDialog} />
                    </ChainContextProvider>
                </NetworkContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
