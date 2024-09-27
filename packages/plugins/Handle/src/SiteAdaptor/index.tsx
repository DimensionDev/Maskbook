import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { type EOAResult, SearchResultType } from '@masknet/web3-shared-base'
import { SearchResultInspector } from './SearchResultInspector.js'
import { base } from '../base.js'
import { Trans } from '@lingui/macro'

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
            description: <Trans>Optimize the display of search results about ENS in social media.</Trans>,
            name: <Trans>ENS</Trans>,
            // eslint-disable-next-line react/naming-convention/component-name
            icon: <Icons.ENS size={36} />,
        },
    ],
}

export default site
