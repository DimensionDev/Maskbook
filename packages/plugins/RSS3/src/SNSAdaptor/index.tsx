import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, SocialAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { setupContext } from './context'
import { TabCard, TabCardType } from './TabCard'

function sorter(a: SocialAddress<NetworkPluginID>, z: SocialAddress<NetworkPluginID>) {
    if (a.type === SocialAddressType.RSS3) return -1
    if (z.type === SocialAddressType.RSS3) return 1
    return 0
}

function shouldDisplay(identity?: SocialIdentity, addressNames?: Array<SocialAddress<NetworkPluginID>>) {
    return !!addressNames?.some((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
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
                TabContent: ({ socialAddressList = [], identity }) => {
                    return (
                        <TabCard socialAddressList={socialAddressList} type={TabCardType.Donation} persona={identity?.publicKey} />
                    )
                },
            },
            Utils: {
                sorter,
                shouldDisplay,
            },
        },
        {
            ID: `${PLUGIN_ID}_footprints`,
            label: 'Footprints',
            priority: 2,
            UI: {
                TabContent: ({ socialAddressList = [], identity }) => {
                    return (
                        <TabCard socialAddressList={socialAddressList} type={TabCardType.Footprint} persona={identity?.publicKey} />
                    )
                },
            },
            Utils: {
                sorter,
                shouldDisplay,
            },
        },
    ],
}

export default sns
