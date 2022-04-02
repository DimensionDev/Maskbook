import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import VCentDialog from './TweetDialog'
import { base } from '../base'
import { ValuablesIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: Component,
    ApplicationEntries: [
        {
            isInDappList: true,
            description: 'Buy & sell tweets autographed by their original creators.',
            name: 'Valuables',
            tutorialLink:
                'https://realmasknetwork.notion.site/See-the-latest-offer-of-a-Tweet-NFT-by-Valuables-Plugin-27424923ee454a4a9b0ed16fc5cb93d0',
            AppIcon: <ValuablesIcon />,
        },
    ],
}

export default sns

function Component() {
    const tweetAddress = usePostInfoDetails.snsID()

    if (!tweetAddress) return null
    // only for the primary tweet on the detailed page
    if (!location.pathname.includes(`/status/${tweetAddress}`)) return null

    return <VCentDialog tweetAddress={tweetAddress} />
}
