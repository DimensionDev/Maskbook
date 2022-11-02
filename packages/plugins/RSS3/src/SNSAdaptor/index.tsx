import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { setupContext } from './context.js'
import { FeedPageProps, FeedsPage } from './FeedsPage.js'

function shouldDisplay(_?: SocialIdentity, socialAccount?: SocialAccount) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const createActivitiesTabConfig = (label: string, props: FeedPageProps): Plugin.SNSAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority: 1,
        UI: {
            TabContent: ({ socialAccount }) => {
                return (
                    <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                        <FeedsPage address={socialAccount?.address} {...props} />
                    </Web3ContextProvider>
                )
            },
        },
        Utils: {
            shouldDisplay,
        },
    }
}

const ActivitiesTabConfig: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig('Activities', {})
const ActivitiesTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig('Activities', {
    p: 1.5,
})

const DonationsTabConfig: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig('Donations', {
    tag: RSS3BaseAPI.Tag.Donation,
})
const DonationsTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig('Donations', {
    tag: RSS3BaseAPI.Tag.Donation,
    p: 1.5,
})

const SocialTabConfig: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig('Social', {
    tag: RSS3BaseAPI.Tag.Social,
})
const SocialTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig('Social', {
    tag: RSS3BaseAPI.Tag.Social,
    p: 1.5,
})

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        setupContext(context)
    },
    ProfileTabs: [ActivitiesTabConfig, DonationsTabConfig, SocialTabConfig],
    ProfileCardTabs: [ActivitiesTabConfigInProfileCard, DonationsTabConfigInProfileCard, SocialTabConfigInProfileCard],
}

export default sns
