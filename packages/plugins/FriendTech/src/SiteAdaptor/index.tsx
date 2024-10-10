import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { FriendTechInjection } from './FriendTechInjection.js'
import { FriendTechNameWidget } from './FriendTechNameWidget.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        return <FriendTechInjection />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.FriendTech size={36} />
            const name = <Trans>Friend</Trans>
            const iconFilterColor = 'rgba(1, 186, 250, 0.20)'
            return {
                ApplicationEntryID: base.ID,
                icon,
                category: 'dapp',
                description: <Trans>Display the user's friend key related information on the timeline on x.com.</Trans>,
                name,
                iconFilterColor,
            }
        })(),
    ],
    NameWidget: {
        ID: `${base.ID}_name_widget`,
        priority: 2,
        UI: {
            Content: FriendTechNameWidget,
        },
    },
}

export default site
