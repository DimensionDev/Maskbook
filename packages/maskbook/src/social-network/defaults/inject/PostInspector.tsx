import { memo } from 'react'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '../../PostInfo'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInspector, PostInspectorProps } from '../../../components/InjectedComponents/PostInspector'
import { makeStyles } from '@material-ui/core'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-es'

export function injectPostInspectorDefault<T extends string>(
    config: InjectPostInspectorDefaultConfig = {},
    additionalPropsToPostInspector: (classes: Record<T, string>) => Partial<PostInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostInspectorDefault = memo(function PostInspectorDefault(props: {
        onDecrypted: PostInspectorProps['onDecrypted']
        zipPost: PostInspectorProps['needZip']
    }) {
        const { onDecrypted, zipPost } = props
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostInspector(classes)
        return <PostInspector onDecrypted={onDecrypted} needZip={zipPost} {...additionalProps} />
    })

    const { zipPost } = config
    const zipPostF = zipPost || noop
    return function injectPostInspector(current: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={current}>
                <PostInspectorDefault
                    onDecrypted={(typed) => {
                        current.transformedPostContent.value = typed
                    }}
                    zipPost={() => zipPostF(current.rootNodeProxy)}
                    {...current}
                />
            </PostInfoProvider>
        )
        if (config.render) {
            const undo = config.render(jsx, current)
            signal.addEventListener('abort', undo)
            return undo
        }
        const root = createReactRootShadowed(current.rootNodeProxy.afterShadow, {
            key: 'post-inspector',
            signal,
        })
        root.render(jsx)
        return root.destory
    }
}

interface InjectPostInspectorDefaultConfig {
    zipPost?(node: DOMProxy): void
    render?(node: React.ReactChild, postInfo: PostInfo): () => void
}
