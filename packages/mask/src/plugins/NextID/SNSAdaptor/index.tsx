import { NetworkPluginID, Plugin, usePluginIDContext } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { NextIdPage } from '../components/NextIdPage'
import { RootContext } from '../contexts'
import { PostTipButton, TipTaskManager } from '../components/Tip'
import { Flags } from '../../../../shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallet',
            priority: 10,
            UI: {
                TabContent: ({ personaList = EMPTY_LIST }) => <NextIdPage personaList={personaList} />,
            },
        },
    ],
    GlobalInjection() {
        if (!Flags.next_id_tip_enabled) return null
        return (
            <RootContext>
                <TipTaskManager />
            </RootContext>
        )
    },
    PostActions() {
        const pluginId = usePluginIDContext()
        if (!Flags.next_id_tip_enabled || pluginId !== NetworkPluginID.PLUGIN_EVM) return null
        return (
            <RootContext>
                <PostTipButton />
            </RootContext>
        )
    },
}

export default sns
