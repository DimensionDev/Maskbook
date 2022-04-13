import { memo } from 'react'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInfoProvider, PostInfo } from '@masknet/plugin-infra/content-script'
import { PostReplacer, PostReplacerProps } from '../../../components/InjectedComponents/PostReplacer'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import { noop } from 'lodash-unified'

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
        createReactRootShadowed(current.rootElement.afterShadow, {
            key: 'post-replacer',
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
