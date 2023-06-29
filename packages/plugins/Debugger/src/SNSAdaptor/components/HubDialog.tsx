import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { HubContent } from './HubContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface HubDialogProps {}

export function HubDialog(props: HubDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.hubDialogUpdated)
    return (
        <InjectedDialog title="Hub" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
                    <HubContent onClose={closeDialog} />
                </Web3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
