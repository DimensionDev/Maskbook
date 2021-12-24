import type { Plugin } from '@masknet/plugin-infra'
import { DonationPage, FootprintPage } from './pages'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: 'donations',
            label: 'Donations',
            priority: 1,
            children: ({ addressNames = [] }) => {
                if (!addressNames.length) return null
                const rss3Name = addressNames.find((x) => x.label.match(/\w+\.rss3$/))
                const address = rss3Name?.resolvedAddress || addressNames[0].resolvedAddress
                return (
                    <>
                        <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
                        <DonationPage address={address} />
                    </>
                )
            },
        },
        {
            ID: 'footprints',
            label: 'Footprints',
            priority: 2,
            children: ({ addressNames = [] }) => {
                if (!addressNames.length) return null
                const rss3Name = addressNames.find((x) => x.label.match(/\w+\.rss3$/))
                const address = rss3Name?.resolvedAddress || addressNames[0].resolvedAddress
                return (
                    <>
                        <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
                        <FootprintPage address={address} />
                    </>
                )
            },
        },
    ],
}

export default sns
