import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { NextIdPage } from '../components/NextIdPage'
import { RootContext } from '../contexts'
import { TipButton, TipTaskManager } from '../components/tip'
import { Flags } from '../../../../shared'
import { EMPTY_LIST } from '@masknet/web3-shared-evm'

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
                <TipButton />
            </RootContext>
        )
    },
}

export default sns
