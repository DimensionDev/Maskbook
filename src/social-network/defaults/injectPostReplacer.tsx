import React from 'react'
import { renderInShadowRoot } from '../../utils/shadow-root/renderInShadowRoot'
import { PostInfoContext } from '../../components/DataSource/usePostInfo'
import { PostReplacer, PostReplacerProps } from '../../components/InjectedComponents/PostReplacer'
import type { PostInfo } from '../PostInfo'
import { makeStyles } from '@material-ui/core'
import type { DOMProxy } from '@dimensiondev/holoflows-kit/es'
import { noop } from 'lodash-es'

export function injectPostReplacer<T extends string>(
    config: injectPostReplacerConfig = {},
    additionalPropsToPostReplacer: (classes: Record<T, string>) => Partial<PostReplacerProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostReplacerDefault = React.memo(function PostReplacerDefault(props: {
        zipPost: PostReplacerProps['zip']
        unZipPost: PostReplacerProps['unzip']
    }) {
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostReplacer(classes)
        return <PostReplacer {...additionalProps} zip={props.zipPost} unzip={props.unZipPost} />
    })

    const { zipPost, unzipPost } = config
    const zipPostF = zipPost || noop
    const unzipPostF = unzipPost || noop
    return function injectPostReplacer(current: PostInfo) {
        return renderInShadowRoot(
            <PostInfoContext.Provider value={current}>
                <PostReplacerDefault
                    zipPost={() => zipPostF(current.rootNodeProxy)}
                    unZipPost={() => unzipPostF(current.rootNodeProxy)}
                    {...current}
                />
            </PostInfoContext.Provider>,
            {
                shadow: () => current.rootNodeProxy.afterShadow,
                normal: () => current.rootNodeProxy.after,
                concurrent: true,
                keyBy: 'post-replacer',
            },
        )
    }
}

interface injectPostReplacerConfig {
    zipPost?(node: DOMProxy): void
    unzipPost?(node: DOMProxy): void
}
