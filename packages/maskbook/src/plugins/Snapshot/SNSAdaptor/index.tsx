import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { useMemo, Suspense } from 'react'
import { Skeleton, makeStyles } from '@material-ui/core'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { PostInspector } from './PostInspector'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { extractTextFromTypedMessage } from '../../../protocols/typed-message'
import { parseURL } from '@masknet/shared'

const useStyles = makeStyles((theme) => {
    return {
        skeleton: {
            margin: theme.spacing(2),
            '&:first-child': {
                marginTop: theme.spacing(3),
            },
        },
    }
})

const isSnaphotURL = (x: string): boolean =>
    /^https:\/\/(?:www.)?snapshot.(org|page)\/#\/(.*?)\/proposal\/[A-Za-z0-9]+$/.test(x)

function Renderer({ url }: { url: string }) {
    const classes = useStyles()
    return (
        <MaskbookPluginWrapper pluginName="Snapshot">
            <Suspense
                fallback={new Array(2).fill(0).map((_, i) => (
                    <Skeleton
                        key={i}
                        className={classes.skeleton}
                        animation="wave"
                        variant="rectangular"
                        width={i === 0 ? '80%' : '60%'}
                        height={15}
                    />
                ))}>
                <PostInspector url={url} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isSnaphotURL)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isSnaphotURL)
        if (!link) return null
        return <Renderer url={link} />
    },
}

export default sns
