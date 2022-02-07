import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { NextIdPage } from '../components/NextIdPage'
import { RootContext } from '../contexts'
import { TipButton, TipTaskManager } from '../components/tip'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallet',
            priority: 10,
            UI: {
                TabContent: NextIdPage,
            },
        },
    ],
    GlobalInjection() {
        return (
            <RootContext>
                <TipTaskManager />
            </RootContext>
        )
    },
    PostActions() {
        return (
            <RootContext>
                <TipButton />
            </RootContext>
        )
    },
}

export default sns
