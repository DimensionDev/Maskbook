import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkContextProvider, ChainContextProvider } from '@masknet/web3-hooks-base'
import { ConnectionContent } from './ConnectionContent.js'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks/index.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface ConnectionDialogProps {}

export function ConnectionDialog(props: ConnectionDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
    return (
        <InjectedDialog title="Connection" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <ChainContextProvider
                        value={{
                            chainId: ChainId.Mainnet,
                        }}>
                        <ConnectionContent onClose={closeDialog} />
                    </ChainContextProvider>
                </NetworkContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
