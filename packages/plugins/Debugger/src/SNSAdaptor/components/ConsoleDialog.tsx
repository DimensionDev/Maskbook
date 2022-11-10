import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ConsoleContent } from './ConsoleContent.js'
import { useRemoteControlledDialog } from '../../../../../shared-base-ui/src/hooks/index.js'
import { PluginDebuggerMessages } from '../../messages.js'
import { SharedContextSettings } from '../../settings/index.js'

export interface ConsoleDialogProps {}

export function ConsoleDialog(props: ConsoleDialogProps) {
    const { open, closeDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)

    if (!SharedContextSettings.value) return null
    return (
        <InjectedDialog title="Debugger" fullWidth open={open} onClose={closeDialog}>
            <DialogContent>
                <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                    <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
                        <ConsoleContent onClose={closeDialog} />
                    </Web3ContextProvider>
                </SNSAdaptorContext.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
