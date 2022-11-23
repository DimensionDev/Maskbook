import type { Plugin } from '@masknet/plugin-infra'

import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    // SearchResultInspector: {
    //     ID: PluginID.DecentralizedSearch,
    //     UI: {
    //         Content: ({ result }) => <SearchResultInspector keyword={result.keyword} />,
    //     },
    //     Utils: {
    //         shouldDisplay({ keyword }) {
    //             return Boolean(
    //                 resolveSearchKeywordType(
    //                     keyword,
    //                     (keyword: string) =>
    //                         isValidDomainEVM(keyword) || isValidDomainSolana(keyword) || isValidDomainFlow(keyword),
    //                     (keyword: string) =>
    //                         (isValidAddressEVM(keyword) && !isZeroAddressEVM(keyword)) ||
    //                         (isValidAddressFlow(keyword) && !isZeroAddressFlow(keyword)) ||
    //                         (isValidAddressSolana(keyword) && !isZeroAddressSolana(keyword)),
    //                 ) && !HiddenAddressList.some((address) => isSameAddress(address, keyword)),
    //             )
    //         },
    //     },
    // },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 20,
            description: <Trans i18nKey="plugin_decentralized_search_description" />,
            name: <Trans i18nKey="plugin_decentralized_search_name" />,
            icon: <Icons.DecentralizedSearch size={36} />,
        },
    ],
}

export default sns
