import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { PreviewCard } from './components/PreviewCard.js'
import { Icons } from '@masknet/icons'
import { parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { base } from '../base.js'
import { PLUGIN_DESCRIPTION, PLUGIN_NAME } from '../constants.js'

const sns: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Danger size={36} />

            return {
                ApplicationEntryID: base.ID,
                icon,
                category: 'dapp',
                name: <Trans i18nKey="__plugin_name" defaults={PLUGIN_NAME} />,
                description: <Trans i18nKey="__plugin_description" defaults={PLUGIN_DESCRIPTION} ns={base.ID} />,
            }
        })(),
    ],
    DecryptedInspector: function Comp(props) {
        const links = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURLs(x.val, false)
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

export default sns
