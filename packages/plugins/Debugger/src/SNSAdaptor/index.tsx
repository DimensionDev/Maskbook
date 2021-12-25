import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { TabContent } from './components/TabContent'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Debugger',
            priority: 99999,
            UI: {
                TabContent,
            }
        }
    ]
}

export default sns
