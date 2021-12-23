import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: 'hello',
            label: 'Hello',
            priority: 1,
            children: () => <div>HELLO!</div>,
        },
    ],
}

export default sns
