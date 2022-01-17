import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { NextIdPage } from '../components/NextIdPage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_nextId`,
            label: 'Wallet',
            priority: 1,
            UI: {
                TabContent: ({ identity }) => {
                    return <NextIdPage />
                },
            },
        },
    ],
}

export default sns
