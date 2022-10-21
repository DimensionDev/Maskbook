import type { Plugin } from '@masknet/plugin-infra'
import { NetworkContextProvider } from '@masknet/web3-hooks-base'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { setupContext } from './context.js'
import { DonationPage, FeedsPage, FeedPageProps, FootprintPageProps, FootprintsPage } from './pages/index.js'

function shouldDisplay(identity?: SocialIdentity, socialAccount?: SocialAccount) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const DonationsTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_donations`,
    label: 'Donations',
    priority: 1,
    UI: {
        TabContent: ({ socialAccount, identity }) => {
            return (
                <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <DonationPage
                        socialAccount={socialAccount}
                        userId={identity?.identifier?.userId}
                        publicKey={identity?.publicKey}
                    />
                </NetworkContextProvider>
            )
        },
    },
    Utils: {
        shouldDisplay,
    },
}

const createFootprintsTabConfig = (
    props: Omit<FootprintPageProps, 'address' | 'publicKey' | 'userId'>,
): Plugin.SNSAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_footprints`,
        label: 'Footprints',
        priority: 2,
        UI: {
            TabContent: ({ socialAccount, identity }) => {
                return (
                    <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                        <FootprintsPage
                            address={socialAccount?.address ?? ''}
                            publicKey={identity?.publicKey}
                            userId={identity?.identifier?.userId ?? ''}
                            {...props}
                        />
                    </NetworkContextProvider>
                )
            },
        },
        Utils: {
            shouldDisplay,
        },
    }
}
const FootprintsTabConfig: Plugin.SNSAdaptor.ProfileTab = createFootprintsTabConfig({})
const FootprintsTabConfigInProfileCard: Plugin.SNSAdaptor.ProfileTab = createFootprintsTabConfig({
    p: 1.5,
    layout: 'grid',
    collectionName: 'POAPs',
})

const createActivitiesTabConfig = (props: FeedPageProps): Plugin.SNSAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_feeds`,
        label: 'Activities',
        priority: 3,
        UI: {
            TabContent: ({ socialAccount }) => {
                return (
                    <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                        <FeedsPage address={socialAccount?.address} {...props} />
                    </NetworkContextProvider>
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

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ProfileTabs: [DonationsTabConfig, FootprintsTabConfig, ActivitiesTabConfig],
    ProfileCardTabs: [
        { ...ActivitiesTabConfigInProfileCard, priority: 1 },
        { ...FootprintsTabConfigInProfileCard, label: 'POAPs', priority: 3 },
    ],
}

export default sns
