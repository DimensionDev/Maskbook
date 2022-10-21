import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { NetworkPluginID, parseURLs } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { PreviewCard } from '../UI/PreviewCard.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { base } from '../base.js'
import { ChainBoundary } from '@masknet/shared'

const isGoodGhosting = (x: string): boolean => /^https:\/\/goodghosting.com/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURLs(x.val).find(isGoodGhosting)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isGoodGhosting)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 13,
            description: <Trans i18nKey="plugin_good_ghosting_description" />,
            name: <Trans i18nKey="plugin_good_ghosting_name" />,
            tutorialLink: 'https://realmasknetwork.notion.site/f94aa38b01404b9c99c7a03935840962',
            icon: <Icons.GoodGhosting size={36} />,
        },
    ],
}

function Renderer(
    props: React.PropsWithChildren<{
        url: string
    }>,
) {
    let [id = ''] = props.url.match(/pools\/([\w ]+)/) ?? []
    if (id) {
        id = id.replace('pools/', '')
    }
    usePluginWrapper(true)

    return (
        <ChainBoundary
            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
            expectedChainId={ChainId.Matic}
            ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
            <PreviewCard id={id} />
        </ChainBoundary>
    )
}

export default sns
