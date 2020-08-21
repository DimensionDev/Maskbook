import React from 'react'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PostInfoContext } from '../../components/DataSource/usePostInfo'
import { PostDummy, PostDummyProps } from '../../components/InjectedComponents/PostDummy'
import type { PostInfo } from '../PostInfo'
import { makeStyles } from '@material-ui/core'

export function injectPostDummyDefault<T extends string>(
    config: InjectPostDummyDefaultConfig = {},
    additionalPropsToPostDummy: (classes: Record<T, string>) => Partial<PostDummyProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostDummyDefault = React.memo(function PostDummyDefault() {
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostDummy(classes)
        return <PostDummy {...additionalProps} />
    })

    return function injectPostDummy(current: PostInfo) {
        return renderInShadowRoot(
            <PostInfoContext.Provider value={current}>
                <PostDummyDefault {...current} />
            </PostInfoContext.Provider>,
            {
                shadow: () => current.rootNodeProxy.afterShadow,
                normal: () => current.rootNodeProxy.after,
                concurrent: true,
            },
        )
    }
}

interface InjectPostDummyDefaultConfig {}
