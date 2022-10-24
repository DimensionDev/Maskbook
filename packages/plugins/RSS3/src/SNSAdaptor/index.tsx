import type { Plugin } from '@masknet/plugin-infra'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { setupContext } from './context.js'
import { DonationPage, FeedsPage, FeedPageProps } from './pages/index.js'

function shouldDisplay(identity?: SocialIdentity, socialAccount?: SocialAccount) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const DonationsTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_donations`,
    label: 'Donations',
    priority: 2,
    UI: {
        TabContent: ({ socialAccount, identity }) => {
            return (
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                    <DonationPage
                        socialAccount={socialAccount}
                        userId={identity?.identifier?.userId}
                        publicKey={identity?.publicKey}
                    />
                </Web3ContextProvider>
            )
        },
    },
    Utils: {
        shouldDisplay,
    },
}

const createActivitiesTabConfig = (props: FeedPageProps): Plugin.SNSAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_feeds`,
        label: 'Activities',
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

const ActivitiesTabConfig: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig({})
const ActivitiesTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createActivitiesTabConfig({
    p: 1.5,
})

const SocialTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_social`,
    label: 'Social',
    priority: 3,
    UI: {
        TabContent: ({ socialAccount }) => {
            return <div>social: {socialAccount?.address}</div>
        },
    },
    Utils: {
        shouldDisplay,
    },
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ProfileTabs: [DonationsTabConfig, ActivitiesTabConfig, SocialTabConfig],
    ProfileCardTabs: [{ ...ActivitiesTabConfigInProfileCard, priority: 1 }, SocialTabConfig],
}

export default sns
