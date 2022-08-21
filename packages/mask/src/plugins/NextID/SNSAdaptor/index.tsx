import type { Plugin } from '@masknet/plugin-infra'
import { PersonaListDialog } from '../../../components/shared/PersonaListDialog'
import { base } from '../base'
import { NextIdPage } from '../components/NextIdPage'
import { PLUGIN_ID } from '../constants'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection: function Component() {
        return <PersonaListDialog />
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallets',
            priority: 10,
            UI: {
                TabContent: ({ identity }) => <NextIdPage />,
            },
        },
    ],
}

export default sns
