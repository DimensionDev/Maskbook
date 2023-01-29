import { Icons } from '@masknet/icons'
import { Plugin, SNSAdaptorContext, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { parseURLs, PluginID } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base.js'
import { PLUGIN_META_KEY, PLUGIN_NAME } from '../constants.js'
import { SharedContextSettings } from '../settings.js'
import { ResultModalProvider, DonateProvider } from './contexts/index.js'
import { PreviewCard } from './PreviewCard.js'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)

function Renderer(props: { id: string }) {
    usePluginWrapper(true)

    return (
        <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
            <ResultModalProvider>
                <DonateProvider>
                    <PreviewCard grantId={props.id} />
                </DonateProvider>
            </ResultModalProvider>
        </SNSAdaptorContext.Provider>
    )
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        SharedContextSettings.value = context
    },
    DecryptedInspector(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURLs(x.val).find(isGitcoin)
        }, [props.message])
        const id = link?.match(/\d+/)?.[0]
        if (!id) return null
        return (
            <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                <Renderer id={id} />
            </SNSAdaptorContext.Provider>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([[PLUGIN_META_KEY, () => PLUGIN_NAME]]),
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isGitcoin)
        const id = link?.match(/\d+/)?.[0]

        if (!id) return null
        return <Renderer id={id} />
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
        icon: (
            <Icons.Gitcoin
                variant="light"
                size={24}
                style={{ filter: 'drop-shadow(0px 6px 12px rgba(255, 159, 10, 0.2))' }}
            />
        ),
    },
}

export default sns
