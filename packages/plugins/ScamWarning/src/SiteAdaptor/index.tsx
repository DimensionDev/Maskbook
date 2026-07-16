import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoMentionedLinks } from '@masknet/plugin-infra/content-script'
import { parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useMemo } from 'react'
import { base } from '../base.js'
import { PreviewCard } from './components/PreviewCard.js'
import { LinkModifier } from './components/LinkModifier.js'
import { TextModifier } from './components/TextModifier.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Danger size={36} />

            return {
                ApplicationEntryID: base.ID,
                icon,
                category: 'dapp',
                name: <Trans>Safety Warning</Trans>,
                description: (
                    <Trans>
                        Detecting whether user-published crypto websites are risky or malicious. Help to save your
                        digital assets.
                    </Trans>
                ),
                tutorialLink: 'https://www.mask.io/help-tutorial/check-security',
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
        const links = usePostInfoMentionedLinks()
        if (!links) return null
        return <PreviewCard links={links} />
    },
    wrapperProps: {
        icon: <Icons.Danger size={24} />,
        backgroundGradient: 'rgba(255, 235, 237)',
    },
    LinkModifier,
    TextModifier,
}

export default site
