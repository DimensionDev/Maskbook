import type { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { context, setupContext } from './context.js'
import { PLUGIN_ID } from '../constants.js'
import { Trans } from 'react-i18next'
import { PluginID } from '@masknet/shared-base'
import { ClaimEntry } from './components/ClaimEntry/index.js'
import { ClaimDialog } from './components/ClaimDialog/index.js'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { ClaimSuccessDialog } from './components/ClaimSuccessDialog/index.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function Component() {
        return (
            <SNSAdaptorContext.Provider value={context}>
                <ClaimDialog />
                <ClaimSuccessDialog />
            </SNSAdaptorContext.Provider>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: (props) => {
                return <ClaimEntry {...props} />
            },
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 8,
            icon: <Icons.MarketsClaim size={36} />,
            name: <Trans ns={PluginID.Claim} i18nKey="__plugin_name" />,
            iconFilterColor: 'rgba(240, 51, 51, 0.3)',
            category: 'dapp',
            entryWalletConnectedNotRequired: true,
        },
    ],
}

export default sns
