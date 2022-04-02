import { useMemo } from 'react'
import { Plugin, usePluginWrapper } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { GoogGhostingIcon } from '@masknet/icons'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { PreviewCard } from '../UI/PreviewCard'
import { ChainId } from '@masknet/web3-shared-evm'
import { base } from '../base'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isGoodGhosting = (x: string): boolean => /^https:\/\/goodghosting.com/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isGoodGhosting)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isGoodGhosting)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            isInDappList: true,
            description: 'Cultivate a weekly saving habit on Twitter.',
            name: 'GoodGhosting',
            tutorialLink:
                'https://realmasknetwork.notion.site/Cultivate-a-weekly-saving-habit-via-GoodGhosting-on-Twitter-Polygon-only-f94aa38b01404b9c99c7a03935840962',
            AppIcon: <GoogGhostingIcon />,
        },
    ],
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    let [id = ''] = props.url.match(/pools\/([\w ]+)/) ?? []
    if (id) {
        id = id.replace('pools/', '')
    }
    usePluginWrapper(true)

    return (
        <EthereumChainBoundary chainId={ChainId.Matic}>
            <PreviewCard id={id} />
        </EthereumChainBoundary>
    )
}

export default sns
