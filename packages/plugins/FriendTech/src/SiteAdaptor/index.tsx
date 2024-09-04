import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { FriendTechInjection } from './FriendTechInjection.js'
import { FriendTechNameWidget } from './FriendTechNameWidget.js'
import { useI18N } from '../locales/i18n_generated.js'

function Name() {
    const t = useI18N()
    return t.name()
}
function Desc() {
    const t = useI18N()
    return t.description()
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        return <FriendTechInjection />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.FriendTech size={36} />
            const name = <Name />
            const iconFilterColor = 'rgba(1, 186, 250, 0.20)'
            return {
                ApplicationEntryID: base.ID,
                icon,
                category: 'dapp',
                description: <Desc />,
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
