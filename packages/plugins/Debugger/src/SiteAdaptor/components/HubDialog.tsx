import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId } from '@masknet/web3-shared-evm'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { HubContent } from './HubContent.js'
import { PluginDebuggerMessages } from '../../messages.js'

export function HubDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.hubDialogUpdated)
    return (
        <InjectedDialog title="Hub" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <EVMWeb3ContextProvider chainId={ChainId.Mainnet}>
                    <HubContent onClose={closeDialog} />
                </EVMWeb3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
