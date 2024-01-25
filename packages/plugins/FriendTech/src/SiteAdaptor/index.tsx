import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { FriendTechInjection } from './FriendTechInjection.js'
import { FriendTechNameWidget } from './FriendTechNameWidget.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        return <FriendTechInjection />
    },
    NameWidget: {
        ID: `${base.ID}_name_widget`,
        priority: 2,
        UI: {
            Content: FriendTechNameWidget,
        },
    },
}

export default site
