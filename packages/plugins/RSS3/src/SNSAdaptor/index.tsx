import type { Plugin } from '@masknet/plugin-infra'
import { PluginIDContextProvider } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { setupContext } from './context'
import { DonationPage, FeedsPage, FootprintsPage } from './pages'

function shouldDisplay(identity?: SocialIdentity, addressName?: SocialAddress<NetworkPluginID>) {
    return addressName?.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM
}

const DonationsTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_donations`,
    label: 'Donations',
    priority: 1,
    UI: {
        TabContent: ({ socialAddress, identity }) => {
            if (!socialAddress?.address || !identity?.identifier?.userId) return null
            return (
                <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <DonationPage
                        socialAddress={socialAddress}
                        userId={identity?.identifier?.userId}
                        publicKey={identity.publicKey}
                    />
                </PluginIDContextProvider>
            )
        },
    },
    Utils: {
        shouldDisplay,
    },
}
const FootprintsTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_footprints`,
    label: 'Footprints',
    priority: 2,
    UI: {
        TabContent: ({ socialAddress, identity }) => {
            if (!socialAddress?.address || !identity?.identifier?.userId) return null
            return (
                <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <FootprintsPage
                        address={socialAddress.address}
                        publicKey={identity.publicKey}
                        userId={identity?.identifier?.userId}
                    />
                </PluginIDContextProvider>
            )
        },
    },
    Utils: {
        shouldDisplay,
    },
}
const ActivitiesTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_feed`,
    label: 'Activities',
    priority: 3,
    UI: {
        TabContent: ({ socialAddress }) => {
            return socialAddress?.address ? (
                <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <FeedsPage address={socialAddress.address} />
                </PluginIDContextProvider>
            ) : null
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
    ProfileTabs: [DonationsTabConfig, FootprintsTabConfig, ActivitiesTabConfig],
}

export default sns
