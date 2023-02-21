import type { Plugin } from '@masknet/plugin-infra'
import { PersonaSelectPanelDialog } from '../../../components/shared/PersonaSelectPanel/PersonaSelectPanelDialog.js'
import { base } from '../base.js'
import { NextIdPage } from '../components/NextIdPage.js'
import { PLUGIN_ID } from '../constants.js'
import { SharedContextSettings } from '../settings.js'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog.js'
import { LeavePageConfirmDialog } from '../../../components/shared/LeavePageConfirmDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        SharedContextSettings.value = context
    },
    GlobalInjection() {
        return (
            <>
                <ApplicationBoardDialog />
                <PersonaSelectPanelDialog />
                <LeavePageConfirmDialog />
            </>
        )
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallets',
            priority: 10,
            UI: {
                TabContent: ({ identity }) => (
                    <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                        <NextIdPage />
                    </SNSAdaptorContext.Provider>
                ),
            },
        },
    ],
}

export default sns
