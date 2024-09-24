import { Trans as Trans2 } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { type EOAResult, SearchResultType } from '@masknet/web3-shared-base'
import { SearchResultInspector } from './SearchResultInspector.js'
import { base } from '../base.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    SearchResultInspector: {
        ID: PluginID.Handle,
        UI: {
            Content: ({ resultList }) => (
                <SearchResultInspector
                    keyword={resultList[0].keyword}
                    keywordType={resultList[0].type}
                    result={resultList[0] as EOAResult<ChainId>}
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
            description: <Trans2 i18nKey="plugin_ens_description" />,
            name: <Trans2 i18nKey="plugin_ens_name" />,
            // eslint-disable-next-line react/naming-convention/component-name
            icon: <Icons.ENS size={36} />,
        },
    ],
}

export default site
