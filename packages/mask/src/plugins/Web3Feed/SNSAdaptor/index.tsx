import type { Plugin } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { Web3FeedPage } from './Web3FeedPage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_web3Feed`,
            label: 'Web3Feed',
            priority: 4,
            UI: {
                TabContent: ({ socialAddress, persona }) => {
                    return <Web3FeedPage socialAddress={socialAddress} persona={persona} />
                },
            },
        },
    ],
}

export default sns
