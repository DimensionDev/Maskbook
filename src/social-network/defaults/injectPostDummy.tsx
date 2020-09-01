import React from 'react'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PostInfoContext } from '../../components/DataSource/usePostInfo'
import { PostDummy, PostDummyProps } from '../../components/InjectedComponents/PostDummy'
import type { PostInfo } from '../PostInfo'
import { makeStyles } from '@material-ui/core'
import type { DOMProxy } from '@holoflows/kit/es'
import { noop } from 'lodash-es'

export function injectPostDummyDefault<T extends string>(
    config: InjectPostDummyDefaultConfig = {},
    additionalPropsToPostDummy: (classes: Record<T, string>) => Partial<PostDummyProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostDummyDefault = React.memo(function PostDummyDefault(props: {
        zipPost: PostDummyProps['zip']
        unZipPost: PostDummyProps['unzip']
    }) {
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostDummy(classes)
        return <PostDummy {...additionalProps} zip={props.zipPost} unzip={props.unZipPost} />
    })

    const { zipPost, unzipPost } = config
    const zipPostF = zipPost || noop
    const unzipPostF = unzipPost || noop
    return function injectPostDummy(current: PostInfo) {
        return renderInShadowRoot(
            <PostInfoContext.Provider value={current}>
                <PostDummyDefault
                    zipPost={() => zipPostF(current.rootNodeProxy)}
                    unZipPost={() => unzipPostF(current.rootNodeProxy)}
                    {...current}
                />
            </PostInfoContext.Provider>,
            {
                shadow: () => current.rootNodeProxy.afterShadow,
                normal: () => current.rootNodeProxy.after,
                concurrent: true,
            },
        )
    }
}

interface InjectPostDummyDefaultConfig {
    zipPost?(node: DOMProxy): void
    unzipPost?(node: DOMProxy): void
}
