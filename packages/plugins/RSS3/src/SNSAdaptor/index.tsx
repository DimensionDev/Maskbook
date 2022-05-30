import { Plugin } from '@masknet/plugin-infra'
import { AddressName, AddressNameType } from '@masknet/web3-shared-evm'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { TabCard, TabCardType } from './TabCard'

function addressNameSorter(a: Plugin.SNSAdaptor.ProfileAddress, z: Plugin.SNSAdaptor.ProfileAddress) {
    if (a.type === AddressNameType.RSS3) return -1
    if (z.type === AddressNameType.RSS3) return 1
    return 0
}

function shouldDisplay(
    identity?: Plugin.SNSAdaptor.ProfileIdentity,
    addressNames?: Plugin.SNSAdaptor.ProfileAddress[],
) {
    return addressNames?.some((x) => x.type === AddressNameType.RSS3) ?? false
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_donations`,
            label: 'Donations',
            priority: 1,
            UI: {
                TabContent: ({ addressNames = [] }) => {
                    return <TabCard addressNames={addressNames as AddressName[]} type={TabCardType.Donation} />
                },
            },
            Utils: {
                addressNameSorter,
                shouldDisplay,
            },
        },
        {
            ID: `${PLUGIN_ID}_footprints`,
            label: 'Footprints',
            priority: 2,
            UI: {
                TabContent: ({ addressNames = [] }) => {
                    return <TabCard addressNames={addressNames as AddressName[]} type={TabCardType.Footprint} />
                },
            },
            Utils: {
                addressNameSorter,
                shouldDisplay,
            },
        },
        {
            ID: `${PLUGIN_ID}_profile`,
            label: 'Profile',
            priority: 2,
            UI: {
                TabContent: ({ addressNames = [] }) => {
                    return <TabCard addressNames={addressNames as AddressName[]} type={TabCardType.Profile} />
                },
            },
            Utils: {
                addressNameSorter,
                shouldDisplay,
            },
        },
    ],
}

export default sns
