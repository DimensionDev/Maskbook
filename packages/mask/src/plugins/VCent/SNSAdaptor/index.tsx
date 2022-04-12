import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import VCentDialog from './TweetDialog'
import { base } from '../base'
import { ValuablesIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: Component,
    ApplicationEntries: [
        {
            category: 'dapp',
            description: { i18nKey: 'plugin_valuables_description', fallback: '' },
            name: { i18nKey: 'plugin_valuables_name', fallback: 'Valuables' },
            marketListSortingPriority: 10,
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
