import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorPluginContext } from '@masknet/web3-providers'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { NextIdPage } from '../components/NextIdPage.js'
import { PersonaSelectPanelDialog } from '../../../components/shared/PersonaSelectPanel/PersonaSelectPanelDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        SNSAdaptorPluginContext.setup(context)
    },
    GlobalInjection() {
        return <PersonaSelectPanelDialog />
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallets',
            priority: 10,
            UI: {
                TabContent: ({ identity }) => (
                    <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                        <NextIdPage />
                    </SNSAdaptorContext.Provider>
                ),
            },
        },
    ],
}

export default sns
