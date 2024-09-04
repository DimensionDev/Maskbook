import { Icons } from '@masknet/icons'
import { type Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { useCalendarTrans } from '../locales/i18n_generated.js'

const recommendFeature = {
    description: <Desc />,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            icon: <Icons.Calendar />,
            name: <Name />,
            category: 'dapp',
            recommendFeature,
            description: recommendFeature.description,
        },
    ],
}
function Desc() {
    const t = useCalendarTrans()
    return t.description()
}
function Name() {
    const t = useCalendarTrans()
    return t.title()
}

export default site
