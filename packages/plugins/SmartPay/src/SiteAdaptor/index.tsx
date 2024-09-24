import { first } from 'lodash-es'
import { useAsync } from 'react-use'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { EVMWeb3ContextProvider, useWallets } from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'
import { SmartPayDialog } from './components/SmartPayDialog.js'
import { InjectReceiveDialog } from './components/ReceiveDialog.js'
import { InjectSmartPayDescriptionDialog } from './components/SmartPayDescriptionDialog.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection: function SmartPayGlobalInjection() {
        const wallets = useWallets()
        const contractAccounts = wallets.filter((x) => x.owner)
        const { value: chainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

        return (
            <EVMWeb3ContextProvider chainId={chainId} account={first(contractAccounts)?.address}>
                <SmartPayDialog />
                <InjectSmartPayDescriptionDialog />
                <InjectReceiveDialog />
            </EVMWeb3ContextProvider>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: (props) => {
                return (
                    <EVMWeb3ContextProvider>
                        <SmartPayEntry {...props} />
                    </EVMWeb3ContextProvider>
                )
            },
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 2,
            marketListSortingPriority: 2,
            name: <Trans>Smart Pay</Trans>,
            icon: <Icons.SmartPay size={36} />,
            category: 'other',
        },
    ],
}

export default site
