import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { base } from '../base'
import { NextIdPage } from '../components/NextIdPage'
import { PLUGIN_ID } from '../constants'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallets',
            priority: 10,
            UI: {
                TabContent: ({ personaList = EMPTY_LIST }) => <NextIdPage personaList={personaList} />,
            },
        },
    ],
}

export default sns
