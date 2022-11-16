import type { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'
import { setupContext, context } from './context.js'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { SmartPayDeployDialog } from './components/SmartPayDeployDialog.js'
import { SmartPayDescriptionDialog } from './components/SmartPayDescriptionDialog.js'
import { SmartPayDialog } from './components/SmartPayDialog.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function Component() {
        return (
            <SNSAdaptorContext.Provider value={context}>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Matic }}>
                    <SmartPayDialog />
                    <SmartPayDeployDialog />
                    <SmartPayDescriptionDialog />
                </Web3ContextProvider>
            </SNSAdaptorContext.Provider>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: (props) => {
                return (
                    <SNSAdaptorContext.Provider value={context}>
                        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Matic }}>
                            <SmartPayEntry {...props} />
                        </Web3ContextProvider>
                    </SNSAdaptorContext.Provider>
                )
            },
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 3,
            marketListSortingPriority: 3,
            name: { i18nKey: '__plugin_name', fallback: 'Smart Pay' },
            icon: <Icons.SmartPay size={36} />,
            category: 'dapp',
        },
    ],
}

export default sns
