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
                TabContent: ({ socialAddress, persona }) => {
                    return <TabCard socialAddress={socialAddress} type={TabCardType.Donation} persona={persona} />
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
                TabContent: ({ socialAddress, persona }) => {
                    return <TabCard socialAddress={socialAddress} type={TabCardType.Footprint} persona={persona} />
                },
            },
            Utils: {
                shouldDisplay,
            },
        },
    ],
}

export default sns
