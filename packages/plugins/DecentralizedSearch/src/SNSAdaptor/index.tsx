import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { resolveSearchKeywordType, isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidAddress as isValidAddressEVM,
    isZeroAddress as isZeroAddressEVM,
    isValidDomain as isValidDomainEVM,
} from '@masknet/web3-shared-evm'
import {
    isValidAddress as isValidAddressSolana,
    isZeroAddress as isZeroAddressSolana,
    isValidDomain as isValidDomainSolana,
} from '@masknet/web3-shared-solana'
import {
    isValidAddress as isValidAddressFlow,
    isZeroAddress as isZeroAddressFlow,
    isValidDomain as isValidDomainFlow,
} from '@masknet/web3-shared-flow'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { SearchResultInspector } from './SearchResultInspector.js'
import { HiddenAddressList } from '../constants.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultInspector: {
        ID: PluginID.DecentralizedSearch,
        UI: {
            Content: ({ result }) => <SearchResultInspector keyword={result.keyword} />,
        },
        Utils: {
            shouldDisplay({ keyword }) {
                return Boolean(
                    resolveSearchKeywordType(
                        keyword,
                        (keyword: string) =>
                            isValidDomainEVM(keyword) || isValidDomainSolana(keyword) || isValidDomainFlow(keyword),
                        (keyword: string) =>
                            (isValidAddressEVM(keyword) && !isZeroAddressEVM(keyword)) ||
                            (isValidAddressFlow(keyword) && !isZeroAddressFlow(keyword)) ||
                            (isValidAddressSolana(keyword) && !isZeroAddressSolana(keyword)),
                    ) && !HiddenAddressList.some((address) => isSameAddress(address, keyword)),
                )
            },
        },
    },
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
