import type { Plugin } from '@masknet/plugin-infra'
import { Box } from '@mui/material'
import { NetworkPluginID, type SocialAccount, type SocialIdentity, SocialAddressType } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { SearchResultType } from '@masknet/web3-shared-base'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { type FeedPageProps, FeedsPage } from './FeedsPage.js'
import { Modals } from './modals/index.js'

function shouldDisplay(_?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const createProfileTabConfig = (label: string, props: FeedPageProps, priority = 1): Plugin.SiteAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority,
        UI: {
            TabContent: ({ socialAccount }) => {
                const key = [socialAccount?.address ?? '-', props.tags ?? '-'].join('_')

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
    props: FeedPageProps,
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

const ActivitiesTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig('Activities', {}, 2)
const ActivitiesTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig('Activities', {}, 2)
const ActivitiesTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig('Activities', {}, 2)

// const DonationTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
//     'Donation',
//     {
//         tags: RSS3BaseAPI.Tag.Donation,
//     },
//     3,
// )
// const DonationsTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
//     'Donation',
//     {
//         tags: RSS3BaseAPI.Tag.Donation,
//     },
//     3,
// )
// const DonationsTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
//     'Donation',
//     {
//         tags: RSS3BaseAPI.Tag.Donation,
//     },
//     3,
// )

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
    },
    1,
)
const SocialTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Social',
    {
        tags: [RSS3BaseAPI.Tag.Social],
    },
    1,
)

const OthersTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Others',
    {
        tags: [RSS3BaseAPI.Tag.Donation],
    },
    3,
)
const OthersTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Others',
    {
        tags: [RSS3BaseAPI.Tag.Donation],
    },
    3,
)
const OthersTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Others',
    {
        tags: [RSS3BaseAPI.Tag.Donation],
    },
    3,
)

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {},
    GlobalInjection() {
        return <Modals />
    },
    ProfileTabs: [ActivitiesTabConfig, SocialTabConfig, OthersTabConfig],
    ProfileCardTabs: [ActivitiesTabConfigInProfileCard, SocialTabConfigInProfileCard, OthersTabConfigInProfileCard],
    SearchResultTabs: [ActivitiesTabConfigInSearchResult, SocialTabConfigInSearchResult, OthersTabConfigInSearchResult],
}

export default site
