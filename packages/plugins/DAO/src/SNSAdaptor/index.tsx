import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PLUGIN_ID, SUPPORTED_TWITTER_IDS } from '../constants'
import { DAOPage } from '../components/DAOPage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_dao`,
            label: 'DAO',
            priority: 1,
            UI: {
                TabContent: ({ identity }) => {
                    return <DAOPage identifier={identity?.identifier} />
                },
            },
            Utils: {
                shouldDisplay: (identity) => {
                    return (
                        !identity?.identifier.isUnknown &&
                        SUPPORTED_TWITTER_IDS.some((x) => x.toLowerCase() === identity?.identifier.userId.toLowerCase())
                    )
                },
            },
        },
    ],
}

export default sns
