import type { Plugin } from '@masknet/plugin-infra'
import { PluginIDContextProvider } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import type { BoxProps } from '@mui/material'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { setupContext } from './context'
import { DonationPage, FeedsPage, FootprintPageProps, FootprintsPage } from './pages'

function shouldDisplay(identity?: SocialIdentity, addressName?: SocialAddress<NetworkPluginID>) {
    return addressName?.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM
}

const DonationsTabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_donations`,
    label: 'Donations',
    priority: 1,
    UI: {
        TabContent: ({ socialAddress, identity }) => {
            return (
                <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                    <DonationPage
                        socialAddress={socialAddress}
                        userId={identity?.identifier?.userId}
                        publicKey={identity?.publicKey}
                    />
                </PluginIDContextProvider>
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
            TabContent: ({ socialAddress, identity }) => {
                return (
                    <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                        <FootprintsPage
                            address={socialAddress?.address ?? ''}
                            publicKey={identity?.publicKey}
                            userId={identity?.identifier?.userId ?? ''}
                            {...props}
                        />
                    </PluginIDContextProvider>
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

const createActivitiesTabConfig = (boxProps: BoxProps): Plugin.SNSAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_feeds`,
        label: 'Activities',
        priority: 3,
        UI: {
            TabContent: ({ socialAddress }) => {
                return (
                    <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                        <FeedsPage address={socialAddress?.address} {...boxProps} />
                    </PluginIDContextProvider>
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
