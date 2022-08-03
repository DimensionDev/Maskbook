import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginIDContextProvider, PluginWeb3ContextProvider } from '@masknet/plugin-infra/web3'
import { ConnectionContent } from './ConnectionContent'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks'
import { PluginDebuggerMessages } from '../../messages'

export interface ConnectionDialogProps {}

export function ConnectionDialog(props: ConnectionDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
    return (
        <InjectedDialog title="Connection" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <PluginWeb3ContextProvider
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                        value={{
                            chainId: ChainId.Mainnet,
                        }}>
                        <ConnectionContent onClose={closeDialog} />
                    </PluginWeb3ContextProvider>
                </PluginIDContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
