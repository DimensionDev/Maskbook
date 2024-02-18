import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { Trans } from 'react-i18next'
import { base } from '../base.js'
import { FriendTechInjection } from './FriendTechInjection.js'
import { FriendTechNameWidget } from './FriendTechNameWidget.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        return <FriendTechInjection />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.FriendTech size={36} />
            const name = <Trans ns={PluginID.FriendTech} i18nKey="name" />
            const iconFilterColor = 'rgba(1, 186, 250, 0.20)'
            return {
                ApplicationEntryID: base.ID,
                icon,
                category: 'dapp',
                description: <Trans ns={PluginID.FriendTech} i18nKey="description" />,
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
