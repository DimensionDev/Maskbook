import type { Plugin } from '@masknet/plugin-infra'
import { SocialAddressType } from '@masknet/web3-shared-base'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { TabContent } from './components/TabContent'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Debugger',
            priority: 99999,
            UI: {
                TabContent,
            },
            Utils: {
                sorter(a, z) {
                    if (a.type === SocialAddressType.ADDRESS) return 1
                    if (z.type === SocialAddressType.ADDRESS) return -1

                    return 0
                },
            },
        },
    ],
}

export default sns
