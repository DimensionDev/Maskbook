import { memo } from 'react'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '../../PostInfo'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInspector, PostInspectorProps } from '../../../components/InjectedComponents/PostInspector'
import { makeStyles } from '@material-ui/core'
import { PostInfoContext } from '../../../components/DataSource/usePostInfo'
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
        return (
            <PostInspector
                onDecrypted={onDecrypted}
                needZip={zipPost}
                AddToKeyStoreProps={{ failedComponent: null }}
                {...additionalProps}
            />
        )
    })

    const { zipPost } = config
    const zipPostF = zipPost || noop
    return function injectPostInspector(current: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoContext.Provider value={current}>
                <PostInspectorDefault
                    onDecrypted={(typed, raw) => {
                        current.decryptedPostContent.value = typed
                        current.decryptedPostContentRaw.value = raw
                    }}
                    zipPost={() => zipPostF(current.rootNodeProxy)}
                    {...current}
                />
            </PostInfoContext.Provider>
        )
        if (config.render) {
            const undo = config.render(jsx, current)
            signal.addEventListener('abort', undo)
            return undo
        }
        return renderInShadowRoot(jsx, {
            shadow: () => current.rootNodeProxy.afterShadow,
            concurrent: true,
            keyBy: 'post-inspector',
            signal,
        })
    }
}

interface InjectPostInspectorDefaultConfig {
    zipPost?(node: DOMProxy): void
    render?(node: React.ReactNode, postInfo: PostInfo): () => void
}
