import { Plugin, PluginId } from '@masknet/plugin-infra'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultBox: {
        ID: PluginId.ENS,
        UI: {
            Content: () => <>123123</>,
        },
        Utils: {
            shouldDisplay(keyword: string) {
                return keyword.includes('vitalik.eth')
            },
        },
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 20,
            description: <Trans i18nKey="plugin_ens_description" />,
            name: <Trans i18nKey="plugin_ens_name" />,
            icon: <Icons.ENS size={36} />,
        },
    ],
}

export default sns
