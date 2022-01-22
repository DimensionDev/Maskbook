import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { SnackbarContent } from '@mui/material'
import { base } from '../base'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared-base'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { FurucomboView } from '../UI/FurucomboView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const matchLink = /^https:\/\/furucombo.app\/invest\/(pool|farm)\/(137|1)\/(0x\w+)/
const isFurucomboLink = (link: string): boolean => matchLink.test(link)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isFurucomboLink)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails.mentionedLinks().find(isFurucomboLink)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, category, chainId, address] = props.url.match(matchLink) ?? []

    return (
        <MaskPluginWrapper pluginName="Furucombo">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary chainId={Number.parseInt(chainId, 10)}>
                    <FurucomboView category={category} address={address} />
                </EthereumChainBoundary>
            </Suspense>
        </MaskPluginWrapper>
    )
}

export default sns
