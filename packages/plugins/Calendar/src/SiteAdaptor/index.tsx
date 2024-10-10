import { Icons } from '@masknet/icons'
import { type Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { Trans } from '@lingui/macro'

const recommendFeature = {
    description: (
        <Trans>
            Highly integrated Web3 news and events on X, providing information on tokens, NFTs, AMAs, and regulatory
            events.
        </Trans>
    ),
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            icon: <Icons.Calendar />,
            name: <Trans>Calendar</Trans>,
            category: 'dapp',
            recommendFeature,
            description: recommendFeature.description,
        },
    ],
}

export default site
