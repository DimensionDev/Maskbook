import { memo } from 'react'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import { PostInfoProvider, type PostInfo } from '@masknet/plugin-infra/content-script'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { PostReplacer, type PostReplacerProps } from '../../../components/InjectedComponents/PostReplacer.js'

interface InjectPostReplacerConfig {
    zipPost(node: DOMProxy): void
    unzipPost(node: DOMProxy): void
}

export function injectPostReplacer(config: InjectPostReplacerConfig) {
    const PostReplacerDefault = memo(function PostReplacerDefault(props: {
        zipPost: PostReplacerProps['zip']
        unZipPost: PostReplacerProps['unzip']
    }) {
        return <PostReplacer zip={props.zipPost} unzip={props.unZipPost} />
    })

    const { zipPost, unzipPost } = config

    return function injectPostReplacer(current: PostInfo, signal: AbortSignal) {
        signal.addEventListener('abort', unzipPost as () => void)
        attachReactTreeWithContainer(current.rootElement.afterShadow, {
            key: 'post-replacer',
            untilVisible: true,
            signal,
        }).render(
            <PostInfoProvider post={current}>
                <PostReplacerDefault
                    zipPost={() => zipPost(current.rootElement)}
                    unZipPost={() => unzipPost(current.rootElement)}
                    {...current}
                />
            </PostInfoProvider>,
        )
    }
}
