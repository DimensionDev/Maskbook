import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { setupContext } from './context'
import { TabCard, TabCardType } from './TabCard'

function shouldDisplay(identity?: SocialIdentity, addressName?: SocialAddress<NetworkPluginID>) {
    return addressName?.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_donations`,
            label: 'Donations',
            priority: 1,
            UI: {
                TabContent: ({ socialAddress, identity }) => {
                    return (
                        <TabCard
                            socialAddress={socialAddress}
                            type={TabCardType.Donation}
                            publicKey={identity?.publicKey}
                        />
                    )
                },
            },
            Utils: {
                shouldDisplay,
            },
        },
        {
            ID: `${PLUGIN_ID}_footprints`,
            label: 'Footprints',
            priority: 2,
            UI: {
                TabContent: ({ socialAddress, identity }) => {
                    return (
                        <TabCard
                            socialAddress={socialAddress}
                            type={TabCardType.Footprint}
                            publicKey={identity?.publicKey}
                        />
                    )
                },
            },
            Utils: {
                shouldDisplay,
            },
        },
        {
            ID: `${PLUGIN_ID}_feed`,
            label: 'Feed',
            priority: 3,
            UI: {
                TabContent: ({ socialAddress, identity }) => {
                    return (
                        <TabCard
                            socialAddress={socialAddress}
                            type={TabCardType.Feed}
                            publicKey={identity?.publicKey}
                        />
                    )
                },
            },
            Utils: {
                shouldDisplay,
            },
        },
    ],
}

export default sns
