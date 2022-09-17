import type { Plugin } from '@masknet/plugin-infra'
import { PersonaSelectPanelDialog } from '../../../components/shared/PersonaSelectPanel/PersonaSelectPanelDialog.js'
import { base } from '../base.js'
import { NextIdPage } from '../components/NextIdPage.js'
import { PLUGIN_ID } from '../constants.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection: function Component() {
        return <PersonaSelectPanelDialog />
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
