import { Plugin } from '@masknet/plugin-infra'
import { AddressName, AddressNameType } from '@masknet/web3-shared-evm'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { TabCard } from './TabCard'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_profile`,
            label: 'Profile',
            priority: 2,
            UI: {
                TabContent: ({ addressNames = [] }) => {
                    return <TabCard addressNames={addressNames as AddressName[]} />
                },
            },
            Utils: {
                addressNameSorter: (a, z) => {
                    if (a.type === AddressNameType.ENS) return -1
                    if (z.type === AddressNameType.ENS) return 1

                    if (a.type === AddressNameType.UNS) return -1
                    if (z.type === AddressNameType.UNS) return 1

                    if (a.type === AddressNameType.DNS) return -1
                    if (z.type === AddressNameType.DNS) return 1

                    if (a.type === AddressNameType.RSS3) return -1
                    if (z.type === AddressNameType.RSS3) return 1

                    if (a.type === AddressNameType.ADDRESS) return -1
                    if (z.type === AddressNameType.ADDRESS) return 1

                    if (a.type === AddressNameType.GUN) return -1
                    if (z.type === AddressNameType.GUN) return 1

                    if (a.type === AddressNameType.THE_GRAPH) return -1
                    if (z.type === AddressNameType.THE_GRAPH) return 1

                    return 0
                },
                shouldDisplay: (identity, addressNames) => {
                    return !!addressNames?.length
                },
            },
        },
    ],
}

export default sns
