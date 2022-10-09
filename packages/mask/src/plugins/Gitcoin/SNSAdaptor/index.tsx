import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { usePostInfoDetails, Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURLs, PluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { PreviewCard } from './PreviewCard.js'
import { base } from '../base.js'
import { PLUGIN_META_KEY, PLUGIN_NAME } from '../constants.js'
import { DonateDialog } from './DonateDialog.js'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURLs(x.val).find(isGitcoin)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    CompositionDialogMetadataBadgeRender: new Map([[PLUGIN_META_KEY, () => PLUGIN_NAME]]),
    GlobalInjection() {
        return <DonateDialog />
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isGitcoin)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans ns={PluginID.Gitcoin} i18nKey="description" />,
            name: <Trans ns={PluginID.Gitcoin} i18nKey="name" />,
            icon: <Icons.Gitcoin size={36} />,
            marketListSortingPriority: 9,
            tutorialLink: 'https://realmasknetwork.notion.site/98ed83784ed4446a8a13fa685c7bddfb',
        },
    ],
    wrapperProps: {
        icon: <Icons.Gitcoin size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(255, 159, 10, 0.2))' }} />,
    },
}

function Renderer(
    props: React.PropsWithChildren<{
        url: string
    }>,
) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    usePluginWrapper(true)
    return <PreviewCard id={id} />
}

export default sns
