import { memo } from 'react'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '../../PostInfo'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInspector, PostInspectorProps } from '../../../components/InjectedComponents/PostInspector'
import { makeStyles } from '@masknet/theme'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-unified'

export function injectPostInspectorDefault<T extends string>(
    config: InjectPostInspectorDefaultConfig = {},
    additionalPropsToPostInspector: (classes: Record<T, string>) => Partial<PostInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => { classes: Record<T, string> } = makeStyles()({}) as any,
) {
    const PostInspectorDefault = memo(function PostInspectorDefault(props: { zipPost: PostInspectorProps['needZip'] }) {
        const { zipPost } = props
        const { classes } = useCustomStyles()
        const additionalProps = additionalPropsToPostInspector(classes)
        return <PostInspector needZip={zipPost} {...additionalProps} />
    })

    const { zipPost, injectionPoint } = config
    const zipPostF = zipPost || noop
    return function injectPostInspector(current: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={current}>
                <PostInspectorDefault zipPost={() => zipPostF(current.rootElement)} {...current} />
            </PostInfoProvider>
        )
        const root = createReactRootShadowed(injectionPoint?.(current) ?? current.rootElement.afterShadow, {
            key: 'post-inspector',
            signal,
        })
        root.render(jsx)
        return root.destory
    }
}

interface InjectPostInspectorDefaultConfig {
    zipPost?(node: DOMProxy): void
    injectionPoint?: (postInfo: PostInfo) => ShadowRoot
}
