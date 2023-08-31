import type { Plugin } from '@masknet/plugin-infra'
import { Box } from '@mui/material'
import { NetworkPluginID, type SocialAccount, type SocialIdentity, SocialAddressType } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DefaultWeb3ContextProvider, useMountReport } from '@masknet/web3-hooks-base'
import { EventID } from '@masknet/web3-telemetry/types'
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
                const key = [socialAccount?.address ?? '-', props.tag ?? '-'].join('_')

                useMountReport(() => {
                    switch (props.tag) {
                        case RSS3BaseAPI.Tag.Donation:
                            return EventID.EntryTimelineHoverUserDonationsSwitchTo
                        case RSS3BaseAPI.Tag.Social:
                            return EventID.EntryTimelineHoverUserSocialSwitchTo
                        default:
                            return EventID.EntryTimelineHoverUserActivitiesSwitchTo
                    }
                })

                return (
                    <DefaultWeb3ContextProvider>
                        <FeedsPage key={key} address={socialAccount?.address} {...props} />
                    </DefaultWeb3ContextProvider>
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
                const key = [socialAccount?.address ?? '-', props.tag ?? '-'].join('_')

                return (
                    <Box style={{ minHeight: 300 }}>
                        <DefaultWeb3ContextProvider>
                            <FeedsPage key={key} address={socialAccount?.address} {...props} />
                        </DefaultWeb3ContextProvider>
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

const DonationTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Donation',
    {
        tag: RSS3BaseAPI.Tag.Donation,
    },
    3,
)
const DonationsTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Donation',
    {
        tag: RSS3BaseAPI.Tag.Donation,
    },
    3,
)
const DonationsTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Donation',
    {
        tag: RSS3BaseAPI.Tag.Donation,
    },
    3,
)

const SocialTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Social',
    {
        tag: RSS3BaseAPI.Tag.Social,
    },
    1,
)
const SocialTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig(
    'Social',
    {
        tag: RSS3BaseAPI.Tag.Social,
    },
    1,
)
const SocialTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig(
    'Social',
    {
        tag: RSS3BaseAPI.Tag.Social,
    },
    1,
)

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {},
    GlobalInjection() {
        return <Modals />
    },
    ProfileTabs: [ActivitiesTabConfig, DonationTabConfig, SocialTabConfig],
    ProfileCardTabs: [ActivitiesTabConfigInProfileCard, DonationsTabConfigInProfileCard, SocialTabConfigInProfileCard],
    SearchResultTabs: [
        ActivitiesTabConfigInSearchResult,
        DonationsTabConfigInSearchResult,
        SocialTabConfigInSearchResult,
    ],
}

export default site
