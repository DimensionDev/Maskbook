import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { SearchResultInspector } from './SearchResultInspector.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultInspector: {
        ID: PluginID.ENS,
        UI: {
            Content: ({ result }) => <SearchResultInspector keyword={result.keyword} />,
        },
        Utils: {
            shouldDisplay(result) {
                console.log({ result })
                return true
            },
        },
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            marketListSortingPriority: 20,
            description: <Trans i18nKey="plugin_ens_description" />,
            name: <Trans i18nKey="plugin_ens_name" />,
            icon: <Icons.ENS size={36} />,
        },
    ],
}

export default sns
