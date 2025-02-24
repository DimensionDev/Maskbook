import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { EVMWeb3ContextProvider, useSmartPayChainId, useWallets } from '@masknet/web3-hooks-base'
import { first } from 'lodash-es'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { InjectReceiveDialog } from './components/ReceiveDialog.js'
import { InjectSmartPayDescriptionDialog } from './components/SmartPayDescriptionDialog.js'
import { SmartPayDialog } from './components/SmartPayDialog.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection: function SmartPayGlobalInjection() {
        const wallets = useWallets()
        const contractAccounts = wallets.filter((x) => x.owner)
        const chainId = useSmartPayChainId()

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
