import { useMemo } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { PreviewCard } from './components/PreviewCard.js'
import { Icons } from '@masknet/icons'
import { parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { base } from '../base.js'
import { useScamWarningTrans } from '../locales/i18n_generated.js'

function Name() {
    const t = useScamWarningTrans()
    return t.__plugin_name()
}
function Desc() {
    const t = useScamWarningTrans()
    return t.__plugin_description()
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Danger size={36} />

            return {
                ApplicationEntryID: base.ID,
                icon,
                category: 'dapp',
                name: <Name />,
                description: <Desc />,
            }
        })(),
    ],
    DecryptedInspector: function Comp(props) {
        const links = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.isNone()) return null
            return parseURLs(x.value, false)
        }, [props.message])
        if (!links) return null
        return <PreviewCard links={links} />
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        if (!links) return null
        return <PreviewCard links={links} />
    },
    wrapperProps: {
        icon: <Icons.Danger size={24} />,
        backgroundGradient: 'rgba(255, 235, 237)',
    },
}

export default site
