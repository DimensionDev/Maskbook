import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginIDContextProvider, PluginWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ConnectionContent } from './ConnectionContent.js'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks/index.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConnectionDialogProps {}

export function ConnectionDialog(props: ConnectionDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
    return (
        <InjectedDialog title="Connection" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <PluginWeb3ContextProvider
                        value={{
                            chainId: ChainId.Mainnet,
                            networkPluginId: NetworkPluginID.PLUGIN_EVM,
                        }}>
                        <ConnectionContent onClose={closeDialog} />
                    </PluginWeb3ContextProvider>
                </PluginIDContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
