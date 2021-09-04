import { Suspense, useMemo } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { useENSDomains } from '@masknet/web3-shared'
import { SnackbarContent } from '@material-ui/core'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../../protocols/typed-message'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { PreviewCard } from './PreviewCard'
import { base } from '../base'
import { PLUGIN_NAME, PLUGIN_META_KEY } from '../constants'
import { DonateDialog } from './DonateDialog'
import { parseURL } from '../../../utils/utils'
import { useLastRecognizedIdentity, useSurfaceRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isGitcoin)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    CompositionDialogMetadataBadgeRender: new Map([[PLUGIN_META_KEY, () => PLUGIN_NAME]]),
    GlobalInjection() {
        const lastRecognizedIdentity = useLastRecognizedIdentity()
        const surfaceRecognizedIdentity = useSurfaceRecognizedIdentity()
        const userId = lastRecognizedIdentity.identifier.userId
        const surfaceUserId = surfaceRecognizedIdentity.identifier.userId
        const surfaceUserBio = surfaceRecognizedIdentity.bio

        const { value: domains = [] } = useENSDomains('theyisiliu')
        return (
            <>
                <DonateDialog />
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        padding: 16,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                    <p>The last recognized id is {userId}.</p>
                    <p>The surface recognized id is {surfaceUserId}.</p>
                    <p>The surface recognized bio is {surfaceUserBio}.</p>
                    <ul>
                        {domains.map((x) => (
                            <li key={x.ownerAddress}>{x.ownerAddress}</li>
                        ))}
                    </ul>
                </div>
            </>
        )
    },
    PostInspector() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isGitcoin)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    return (
        <MaskbookPluginWrapper pluginName="Gitcoin">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <PreviewCard id={id} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}

export default sns
