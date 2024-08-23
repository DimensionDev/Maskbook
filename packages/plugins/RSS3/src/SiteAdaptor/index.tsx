import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, type SocialAccount, SocialAddressType, type SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { SearchResultType } from '@masknet/web3-shared-base'
import { Box } from '@mui/material'
import { memo } from 'react'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { toggleFilter } from './emitter.js'
import { type FeedsPageProps, FeedsPage } from './FeedsPage.js'
import { Modals } from './modals/index.js'

function shouldDisplay(_?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const createProfileTabConfig = (label: string, props: FeedsPageProps, priority = 1): Plugin.SiteAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority,
        UI: {
            TabContent: ({ socialAccount }) => {
                const key = [socialAccount?.address ?? '-', props.tags ?? '-'].join('/')

                return (
                    <EVMWeb3ContextProvider>
                        <FeedsPage key={key} address={socialAccount?.address} {...props} />
                    </EVMWeb3ContextProvider>
                )
            },
        },
        Utils: {
            shouldDisplay,
        },
    }
}

const createSearchTabConfig = (
    label: string,
    props: FeedsPageProps,
    priority = 1,
): Plugin.SiteAdaptor.SearchResultTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority,
        UI: {
            TabContent: ({ result }) => {
                const socialAccount = {
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    address: result.type === SearchResultType.Domain ? result.address ?? '' : result.keyword,
                    label: result.type === SearchResultType.Domain ? result.keyword : '',
                    supportedAddressTypes: [SocialAddressType.ENS],
                }
                const key = [socialAccount.address ?? '-', props.tags ?? '-'].join('_')

                return (
                    <Box style={{ minHeight: 300 }}>
                        <EVMWeb3ContextProvider>
                            <FeedsPage key={key} address={socialAccount.address} {...props} />
                        </EVMWeb3ContextProvider>
                    </Box>
                )
            },
        },
        Utils: {
            shouldDisplay(result) {
                return [SearchResultType.Domain, SearchResultType.EOA].includes(result.type)
            },
        },
    }
}

const FinanceTags = [RSS3BaseAPI.Tag.Exchange, RSS3BaseAPI.Tag.Transaction]
const FinanceTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig('Finance', { tags: FinanceTags }, 2)
const FinanceTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Finance',
    {
        tags: FinanceTags,
        height: 392,
        overflow: 'auto',
        listProps: {
            style: {
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'auto',
                scrollbarWidth: 'none',
            },
        },
    },
    2,
)
const FinanceTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Finance',
    {
        tags: FinanceTags,
        height: 478,
        overflow: 'auto',
        listProps: {
            style: {
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'auto',
                scrollbarWidth: 'none',
            },
        },
    },
    2,
)

const SocialTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Social',
    {
        tags: [RSS3BaseAPI.Tag.Social],
    },
    1,
)
const SocialTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Social',
    {
        tags: [RSS3BaseAPI.Tag.Social],
        height: 392,
        overflow: 'auto',
        listProps: {
            style: {
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'auto',
                scrollbarWidth: 'none',
            },
        },
    },
    1,
)
const SocialTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Social',
    {
        tags: [RSS3BaseAPI.Tag.Social],
        height: 478,
        overflow: 'auto',
        listProps: {
            style: {
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'auto',
                scrollbarWidth: 'none',
            },
        },
    },
    1,
)

const OthersTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Others',
    {
        tags: [RSS3BaseAPI.Tag.Metaverse],
    },
    3,
)
const OthersTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Others',
    {
        tags: [RSS3BaseAPI.Tag.Metaverse],
        height: 392,
        overflow: 'auto',
        listProps: {
            style: {
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'auto',
                scrollbarWidth: 'none',
            },
        },
    },
    3,
)
const OthersTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Others',
    {
        tags: [RSS3BaseAPI.Tag.Metaverse],
        height: 478,
        overflow: 'auto',
        listProps: {
            style: {
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'auto',
                scrollbarWidth: 'none',
            },
        },
    },
    3,
)

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {},
    GlobalInjection() {
        return <Modals />
    },
    ProfileTabActions: memo(function FeedFilterButton() {
        return <Icons.Filter size={24} onClick={toggleFilter} />
    }),
    ProfileTabs: [FinanceTabConfig, SocialTabConfig, OthersTabConfig],
    ProfileCardTabs: [FinanceTabConfigInProfileCard, SocialTabConfigInProfileCard, OthersTabConfigInProfileCard],
    SearchResultTabs: [FinanceTabConfigInSearchResult, SocialTabConfigInSearchResult, OthersTabConfigInSearchResult],
}

export default site
