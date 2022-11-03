import type { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SmartPayEntry } from './components/SmartPayEntry.js'
import { setupContext } from './context.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: SmartPayEntry,
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
