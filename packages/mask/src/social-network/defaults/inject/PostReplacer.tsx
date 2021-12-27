import { memo } from 'react'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { PostReplacer, PostReplacerProps } from '../../../components/InjectedComponents/PostReplacer'
import type { PostInfo } from '../../PostInfo'
import { makeStyles } from '@masknet/theme'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import { noop } from 'lodash-unified'

export function injectPostReplacer<T extends string>(
    config: injectPostReplacerConfig = {},
    additionalPropsToPostReplacer: (classes: Record<T, string>) => Partial<PostReplacerProps> = () => ({}),
    useCustomStyles: (props?: any) => { classes: Record<T, string> } = makeStyles()({}) as any,
) {
    const PostReplacerDefault = memo(function PostReplacerDefault(props: {
        zipPost: PostReplacerProps['zip']
        unZipPost: PostReplacerProps['unzip']
    }) {
        const { classes } = useCustomStyles()
        const additionalProps = additionalPropsToPostReplacer(classes)
        return <PostReplacer {...additionalProps} zip={props.zipPost} unzip={props.unZipPost} />
    })

    const { zipPost, unzipPost } = config
    const zipPostF = zipPost || noop
    const unzipPostF = unzipPost || noop
    return function injectPostReplacer(current: PostInfo, signal: AbortSignal) {
        signal.addEventListener('abort', unzipPostF)
        createReactRootShadowed(current.rootNodeProxy.afterShadow, {
            key: 'post-replacer',
            signal,
        }).render(
            <PostInfoProvider post={current}>
                <PostReplacerDefault
                    zipPost={() => zipPostF(current.rootNodeProxy)}
                    unZipPost={() => unzipPostF(current.rootNodeProxy)}
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
