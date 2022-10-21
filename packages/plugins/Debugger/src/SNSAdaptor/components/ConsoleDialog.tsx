import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkContextProvider, ChainContextProvider } from '@masknet/web3-hooks-base'
import { ConsoleContent } from './ConsoleContent.js'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks/index.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConsoleDialogProps {}

export function ConsoleDialog(props: ConsoleDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <ChainContextProvider
                        value={{
                            chainId: ChainId.Mainnet,
                            pluginID: NetworkPluginID.PLUGIN_EVM,
                        }}>
                        <ConsoleContent onClose={closeDialog} />
                    </ChainContextProvider>
                </NetworkContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
