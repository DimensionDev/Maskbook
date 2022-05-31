import { Plugin } from '@masknet/plugin-infra'
import { AddressName } from '@masknet/web3-shared-evm'
import { IdentityAddress, IdentityAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { TabCard, TabCardType } from './TabCard'

function addressNameSorter(a: IdentityAddress, z: IdentityAddress) {
    if (a.type === IdentityAddressType.RSS3) return -1
    if (z.type === IdentityAddressType.RSS3) return 1
    return 0
}

function shouldDisplay(identity?: SocialIdentity, addressNames?: IdentityAddress[]) {
    return addressNames?.some((x) => x.type === IdentityAddressType.RSS3) ?? false
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
                    return <TabCard addressNames={addressNames as IdentityAddress[]} type={TabCardType.Donation} />
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
                    return <TabCard addressNames={addressNames as IdentityAddress[]} type={TabCardType.Footprint} />
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
