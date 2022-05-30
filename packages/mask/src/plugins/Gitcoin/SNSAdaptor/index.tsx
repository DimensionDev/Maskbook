import { useMemo } from 'react'
import { usePostInfoDetails, Plugin, usePluginWrapper, PluginId } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { GitcoinIcon } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { base } from '../base'
import { PLUGIN_META_KEY, PLUGIN_NAME } from '../constants'
import { DonateDialog } from './DonateDialog'
import { PreviewCard } from './PreviewCard'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isGitcoin)
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
            description: <Trans ns={PluginId.Gitcoin} i18nKey="description" />,
            name: <Trans ns={PluginId.Gitcoin} i18nKey="name" />,
            icon: <GitcoinIcon />,
            marketListSortingPriority: 9,
            tutorialLink: 'https://realmasknetwork.notion.site/98ed83784ed4446a8a13fa685c7bddfb',
        },
    ],
    wrapperProps: {
        icon: (
            <GitcoinIcon
                style={{ width: 24, height: 24, filter: 'drop-shadow(0px 6px 12px rgba(255, 159, 10, 0.2))' }}
            />
        ),
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    usePluginWrapper(true)
    return <PreviewCard id={id} />
}

export default sns
