import { memo } from 'react'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { PostInfoProvider, type PostInfo } from '@masknet/plugin-infra/content-script'
import { PostReplacer, type PostReplacerProps } from '../../../components/InjectedComponents/PostReplacer.js'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import { noop } from 'lodash-es'

export function injectPostReplacer(config: injectPostReplacerConfig = {}) {
    const PostReplacerDefault = memo(function PostReplacerDefault(props: {
        zipPost: PostReplacerProps['zip']
        unZipPost: PostReplacerProps['unzip']
    }) {
        return <PostReplacer zip={props.zipPost} unzip={props.unZipPost} />
    })

    const { zipPost, unzipPost } = config
    const zipPostF = zipPost || noop
    const unzipPostF = unzipPost || noop
    return function injectPostReplacer(current: PostInfo, signal: AbortSignal) {
        signal.addEventListener('abort', unzipPostF)
        attachReactTreeWithContainer(current.rootElement.afterShadow, {
            key: 'post-replacer',
            untilVisible: true,
            signal,
        }).render(
            <PostInfoProvider post={current}>
                <PostReplacerDefault
                    zipPost={() => zipPostF(current.rootElement)}
                    unZipPost={() => unzipPostF(current.rootElement)}
                    {...current}
                />
            </PostInfoProvider>,
        )
    }
}

interface injectPostReplacerConfig {
    zipPost?(node: DOMProxy): void
    unzipPost?(node: DOMProxy): void
}
