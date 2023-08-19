import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId } from '@masknet/web3-shared-evm'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { HubContent } from './HubContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export interface HubDialogProps {}

export function HubDialog(props: HubDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.hubDialogUpdated)
    return (
        <InjectedDialog title="Hub" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <DefaultWeb3ContextProvider value={{ chainId: ChainId.Mainnet }}>
                    <HubContent onClose={closeDialog} />
                </DefaultWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
