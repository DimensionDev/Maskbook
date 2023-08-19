import { first } from 'lodash-es'
import { useAsync } from 'react-use'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { DefaultWeb3ContextProvider, useWallets } from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'
import { SmartPayDialog } from './components/index.js'
import { InjectReceiveDialog } from './components/ReceiveDialog.js'
import { InjectSmartPayDescriptionDialog } from './components/SmartPayDescriptionDialog.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    GlobalInjection: function SmartPayGlobalInjection() {
        const wallets = useWallets()
        const contractAccounts = wallets.filter((x) => x.owner)
        const { value: chainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

        return (
            <DefaultWeb3ContextProvider value={{ chainId, account: first(contractAccounts)?.address }}>
                <SmartPayDialog />
                <InjectSmartPayDescriptionDialog />
                <InjectReceiveDialog />
            </DefaultWeb3ContextProvider>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: (props) => {
                return (
                    <DefaultWeb3ContextProvider>
                        <SmartPayEntry {...props} />
                    </DefaultWeb3ContextProvider>
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

export default site
