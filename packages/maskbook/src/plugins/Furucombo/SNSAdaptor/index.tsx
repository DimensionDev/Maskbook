import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import { extractTextFromTypedMessage } from '../../../protocols/typed-message'
import { parseURL } from '../../../utils/utils'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { FurucomboView } from '../UI/FurucomboView'

const matchLink = /^https:\/\/furucombo.app\/invest\/(pool|farm)\/(137|1)\/(0x[\dA-Fa-f]+)/
const isFurucomboLink = (link: string): boolean => matchLink.test(link)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isFurucomboLink)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isFurucomboLink)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, category, chainId, address] = props.url.match(matchLink) ?? []

    return (
        <MaskPluginWrapper pluginName="Furucombo">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <FurucomboView chainId={chainId} category={category} address={address} />
            </Suspense>
        </MaskPluginWrapper>
    )
}

export default sns
