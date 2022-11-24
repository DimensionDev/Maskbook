import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { Trans } from 'react-i18next'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { SearchResultInspector } from './SearchResultInspector.js'
import { SearchResultType, DomainResult } from '@masknet/web3-shared-base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultInspector: {
        ID: PluginID.ENS,
        UI: {
            Content: ({ result }) => (
                <SearchResultInspector
                    keyword={result.keyword}
                    keywordType={result.type}
                    result={result as DomainResult<ChainId>}
                />
            ),
        },
        Utils: {
            shouldDisplay(result) {
                return [SearchResultType.Domain, SearchResultType.EOA].includes(result.type)
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
