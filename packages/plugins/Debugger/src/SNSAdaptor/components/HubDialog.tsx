import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkContextProvider, ChainContextProvider } from '@masknet/web3-hooks-base'
import { HubContent } from './HubContent.js'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks/index.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface HubDialogProps {}

export function HubDialog(props: HubDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.hubDialogUpdated)
    return (
        <InjectedDialog title="Hub" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <ChainContextProvider
                        value={{
                            chainId: ChainId.Mainnet,
                            pluginID: NetworkPluginID.PLUGIN_EVM,
                        }}>
                        <HubContent onClose={closeDialog} />
                    </ChainContextProvider>
                </NetworkContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
