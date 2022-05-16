import { useMemo } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { usePostInfoDetails, Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { GitcoinIcon } from '@masknet/icons'
import { PreviewCard } from './PreviewCard'
import { Trans } from 'react-i18next'
import { base } from '../base'
import { PLUGIN_NAME, PLUGIN_META_KEY } from '../constants'
import { DonateDialog } from './DonateDialog'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)
const isGitCoinSupported = (chainId: ChainId) => [ChainId.Mainnet, ChainId.Matic].includes(chainId)

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
            description: <Trans i18nKey="plugin_gitcoin_description" />,
            name: <Trans i18nKey="plugin_gitcoin_name" />,
            icon: <GitcoinIcon />,
            marketListSortingPriority: 9,
            tutorialLink: 'https://realmasknetwork.notion.site/98ed83784ed4446a8a13fa685c7bddfb',
        },
    ],
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary chainId={isGitCoinSupported(chainId) ? chainId : ChainId.Mainnet}>
            <PreviewCard id={id} />
        </EthereumChainBoundary>
    )
}

export default sns
