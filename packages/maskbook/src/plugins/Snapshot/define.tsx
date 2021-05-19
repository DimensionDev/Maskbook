import { useMemo, Suspense } from 'react'
import { Skeleton, makeStyles } from '@material-ui/core'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { SNAPSHOT_PLUGIN_NAME, SNAPSHOT_PLUGIN_ID } from './constants'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { PostInspector } from './UI/PostInspector'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { parseURL } from '../../utils/utils'

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

export const SnapShotPluginDefine: PluginConfig = {
    id: SNAPSHOT_PLUGIN_ID,
    pluginName: SNAPSHOT_PLUGIN_NAME,
    identifier: SNAPSHOT_PLUGIN_ID,
    pluginIcon: '📷',
    pluginDescription: 'A plugin for https://snapshot.org/',
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isSnaphotURL)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails('postMetadataMentionedLinks')
            .concat(usePostInfoDetails('postMentionedLinks'))
            .find(isSnaphotURL)
        if (!link) return null
        return <Renderer url={link} />
    },
}

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
                        height={15}></Skeleton>
                ))}>
                <PostInspector url={url} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
