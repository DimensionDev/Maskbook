import { memo } from 'react'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import { type PostInfo, PostInfoContext } from '@masknet/plugin-infra/content-script'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import {
    PostInspector,
    type PostInspectorProps,
    type PostPayloadContext,
} from '../../../components/InjectedComponents/PostInspector.js'
import { noop } from 'lodash-es'

export function injectPostInspectorDefault(
    config: InjectPostInspectorDefaultConfig = {},
    props?: Pick<PostInspectorProps, 'slotPosition'>,
) {
    const PostInspectorDefault = memo(function PostInspectorDefault(props: Pick<PostInspectorProps, 'zipPost'>) {
        return <PostInspector slotPosition="after" {...props} />
    })

    const { zipPost, injectionPoint } = config
    const zipPostF = zipPost || noop

    return function injectPostInspector(postInfo: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoContext value={postInfo}>
                <PostInspectorDefault {...props} zipPost={(context) => zipPostF(postInfo.rootElement, context)} />
            </PostInfoContext>
        )
        const root = attachReactTreeWithContainer(injectionPoint?.(postInfo) ?? postInfo.rootElement.afterShadow, {
            key: 'post-inspector',
            untilVisible: true,
            signal,
        })
        root.render(jsx)
        return root.destroy
    }
}

interface InjectPostInspectorDefaultConfig {
    zipPost?(node: DOMProxy, postPayloadContext?: PostPayloadContext): void
    injectionPoint?: (postInfo: PostInfo) => ShadowRoot
}
