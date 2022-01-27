import type { PostInfo } from '../../PostInfo'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInspector } from '../../../components/InjectedComponents/PostInspector'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import { PostReplacer } from '../../../components/InjectedComponents/PostReplacer'

export function injectPostInspectorDefault(config: InjectPostInspectorDefaultConfig = {}) {
    const { injectionPoint } = config
    return function injectPostInspector(current: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={current}>
                <PostReplacer
                    zip={() => config.zip?.(current.rootElement)}
                    unzip={() => config.unzip?.(current.rootElement)}
                    {...current}
                />
                <PostInspector />
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
    injectionPoint?: (postInfo: PostInfo) => ShadowRoot
    zip?(node: DOMProxy): void
    unzip?(node: DOMProxy): void
}
