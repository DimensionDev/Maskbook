import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Box } from '@mui/material'
import { useMountReport } from '@masknet/web3-telemetry/hooks'
import { RSS3BaseAPI, TelemetryAPI } from '@masknet/web3-providers/types'
import { SocialAddressType, SearchResultType } from '@masknet/web3-shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { setupContext } from './context.js'
import { FeedPageProps, FeedsPage } from './FeedsPage.js'

function shouldDisplay(_?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const createProfileTabConfig = (label: string, props: FeedPageProps, priority = 1): Plugin.SNSAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority,
        UI: {
            TabContent: ({ socialAccount }) => {
                const key = [socialAccount?.address ?? '-', props.tag ?? '-'].join('_')

                useMountReport(
                    props.tag === RSS3BaseAPI.Tag.Donation
                        ? TelemetryAPI.EventID.AccessWeb3ProfileDialogDonationTab
                        : props.tag === RSS3BaseAPI.Tag.Social
                        ? TelemetryAPI.EventID.AccessWeb3ProfileDialogSocialTab
                        : TelemetryAPI.EventID.AccessWeb3ProfileDialogActivitiesTab,
                )

                return (
                    <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                        <FeedsPage key={key} address={socialAccount?.address} {...props} />
                    </Web3ContextProvider>
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
): Plugin.SNSAdaptor.SearchResultTab => {
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

                useMountReport(
                    props.tag === RSS3BaseAPI.Tag.Donation
                        ? TelemetryAPI.EventID.AccessWeb3TabDonationTab
                        : props.tag === RSS3BaseAPI.Tag.Social
                        ? TelemetryAPI.EventID.AccessWeb3TabSocialTab
                        : TelemetryAPI.EventID.AccessWeb3TabActivitiesTab,
                )

                return (
                    <Box style={{ minHeight: 300 }}>
                        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                            <FeedsPage key={key} address={socialAccount?.address} {...props} />
                        </Web3ContextProvider>
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

const ActivitiesTabConfig: Plugin.SNSAdaptor.ProfileTab = createProfileTabConfig('Activities', {})
const ActivitiesTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createProfileTabConfig('Activities', {}, 2)
const ActivitiesTabConfigInSearchResult: Plugin.SNSAdaptor.SearchResultTab = createSearchTabConfig('Activities', {}, 2)

const DonationTabConfig: Plugin.SNSAdaptor.ProfileTab = createProfileTabConfig('Donation', {
    tag: RSS3BaseAPI.Tag.Donation,
})
const DonationsTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createProfileTabConfig(
    'Donation',
    {
        tag: RSS3BaseAPI.Tag.Donation,
    },
    2,
)
const DonationsTabConfigInSearchResult: Plugin.SNSAdaptor.SearchResultTab = createSearchTabConfig(
    'Donation',
    {
        tag: RSS3BaseAPI.Tag.Donation,
    },
    2,
)

const SocialTabConfig: Plugin.SNSAdaptor.ProfileTab = createProfileTabConfig('Social', {
    tag: RSS3BaseAPI.Tag.Social,
})
const SocialTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createProfileTabConfig(
    'Social',
    {
        tag: RSS3BaseAPI.Tag.Social,
    },
    2,
)
const SocialTabConfigInSearchResult: Plugin.SNSAdaptor.SearchResultTab = createSearchTabConfig(
    'Social',
    {
        tag: RSS3BaseAPI.Tag.Social,
    },
    2,
)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        setupContext(context)
    },
    ProfileTabs: [ActivitiesTabConfig, DonationTabConfig, SocialTabConfig],
    ProfileCardTabs: [ActivitiesTabConfigInProfileCard, DonationsTabConfigInProfileCard, SocialTabConfigInProfileCard],
    SearchResultTabs: [
        ActivitiesTabConfigInSearchResult,
        DonationsTabConfigInSearchResult,
        SocialTabConfigInSearchResult,
    ],
}

export default sns
