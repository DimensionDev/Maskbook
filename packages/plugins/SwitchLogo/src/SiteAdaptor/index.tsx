import type { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { SwitchLogoDialog } from './SwitchLogoDialog.js'
import { Trans } from '@lingui/macro'

const recommendFeature = {
    description: <Trans>Switch between the classic Twitter logo and the new one.</Trans>,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 10,
            icon: <Icons.TwitterColored size={36} />,
            name: <Trans>Switch X Logo</Trans>,
            category: 'dapp',
            recommendFeature,
            description: recommendFeature.description,
        },
    ],
    GlobalInjection() {
        return <SwitchLogoDialog />
    },
}

export default site
