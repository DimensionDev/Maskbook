import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { NextIdPage } from '../components/NextIdPage.js'
import { PersonaSelectPanelDialog } from '../../../components/shared/PersonaSelectPanel/PersonaSelectPanelDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    GlobalInjection() {
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
