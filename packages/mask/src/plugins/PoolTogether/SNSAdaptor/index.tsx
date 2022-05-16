import { useMemo } from 'react'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { base } from '../base'
import { DepositDialog } from '../UI/DepositDialog'
import { Trans } from 'react-i18next'
import { URL_PATTERN } from '../constants'
import { PoolTogetherView } from '../UI/PoolTogetherView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { PoolTogetherIcon } from '@masknet/icons'

const isPoolTogetherUrl = (url: string) => URL_PATTERN.test(url)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isPoolTogetherUrl)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isPoolTogetherUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
    GlobalInjection: function Component() {
        return <DepositDialog />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="plugin_pooltogether_description" />,
            name: <Trans i18nKey="plugin_pooltogether_name" />,
            marketListSortingPriority: 14,
            tutorialLink: 'https://realmasknetwork.notion.site/377597e14aff441ab645ecba5ea690f1',
            icon: <PoolTogetherIcon />,
        },
    ],
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary
            chainId={ChainId.Mainnet}
            isValidChainId={(chainId) => [ChainId.Mainnet, ChainId.Matic].includes(chainId)}>
            <PoolTogetherView />
        </EthereumChainBoundary>
    )
}
