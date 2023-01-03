import type { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'
import { setupContext, context } from './context.js'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ApproveMaskDialog, ReceiveDialog, SmartPayDescriptionDialog, SmartPayDialog } from './components/index.js'
import { useAsync } from 'react-use'
import { SmartPayBundler } from '@masknet/web3-providers'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function Component() {
        const { value: chainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

        return (
            <SNSAdaptorContext.Provider value={context}>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId }}>
                    <SmartPayDialog />
                    <SmartPayDescriptionDialog />
                    <ApproveMaskDialog />
                    <ReceiveDialog />
                </Web3ContextProvider>
            </SNSAdaptorContext.Provider>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: (props) => {
                return (
                    <SNSAdaptorContext.Provider value={context}>
                        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                            <SmartPayEntry {...props} />
                        </Web3ContextProvider>
                    </SNSAdaptorContext.Provider>
                )
            },
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 3,
            marketListSortingPriority: 3,
            nextIdRequired: true,
            name: { i18nKey: '__plugin_name', fallback: 'Smart Pay' },
            icon: <Icons.SmartPay size={36} />,
            category: 'other',
        },
    ],
}

export default sns
