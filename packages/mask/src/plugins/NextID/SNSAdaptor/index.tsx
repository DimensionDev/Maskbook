import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Flags } from '../../../../shared'
import { base } from '../base'
import { NextIdPage } from '../components/NextIdPage'
import { PostTipButton, TipTaskManager } from '../components/Tip'
import { PLUGIN_ID } from '../constants'
import { RootContext } from '../contexts'

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
        if (!Flags.next_id_tip_enabled) return null
        return (
            <RootContext>
                <PostTipButton />
            </RootContext>
        )
    },
}

export default sns
