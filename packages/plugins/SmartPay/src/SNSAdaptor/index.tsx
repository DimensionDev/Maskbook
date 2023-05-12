import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { Web3ContextProvider, useWallets } from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { first } from 'lodash-es'
import { Trans } from 'react-i18next'
import { useAsync } from 'react-use'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'
import { SmartPayDialog } from './components/index.js'
import { context, setupContext } from './context.js'
import { InjectReceiveDialog } from './components/ReceiveDialog.js'
import { InjectSmartPayDescriptionDialog } from './components/SmartPayDescriptionDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function SmartPayGlobalInjection() {
        const wallets = useWallets()
        const contractAccounts = wallets.filter((x) => x.owner)
        const { value: chainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

        return (
            <SNSAdaptorContext.Provider value={context}>
                <Web3ContextProvider
                    value={{
                        pluginID: NetworkPluginID.PLUGIN_EVM,
                        chainId,
                        account: first(contractAccounts)?.address,
                    }}>
                    <SmartPayDialog />
                    <InjectSmartPayDescriptionDialog />
                    <InjectReceiveDialog />
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
            appBoardSortingDefaultPriority: 2,
            marketListSortingPriority: 2,
            name: <Trans ns={PluginID.SmartPay} i18nKey="__plugin_name" />,
            icon: <Icons.SmartPay size={36} />,
            category: 'other',
        },
    ],
}

export default sns
