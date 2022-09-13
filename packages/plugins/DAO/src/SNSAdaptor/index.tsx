import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { DAOPage } from '../components/DAOPage.js'
import { create } from '@masknet/configuration'

// cspell:disable
const DEFAULT_SUPPORTED_TWITTER_IDS = [
    'ConstitutionDAO',
    'juiceboxETH',
    'AssangeDAO',
    'OfficialMoonDAO',
    'TheSpiceDAO',
    'sharkdao',
    'CrayonFinance',
    'merge_dao',
    'DAOTaiFung',
    'Tile_DAO',
    'mountaindao',
    'OfficialMoonDAO',
]
// cspell:enable

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
                shouldDisplay: (identity, _addressNames) => {
                    const daoTabTwitterIdList = create(
                        'twitter-supported-id-list',
                        '',
                        DEFAULT_SUPPORTED_TWITTER_IDS,
                    ).get()

                    if (!identity?.identifier) return false
                    return (daoTabTwitterIdList ?? []).some(
                        (x) => x.toLowerCase() === identity?.identifier?.userId.toLowerCase(),
                    )
                },
            },
        },
    ],
}

export default sns
