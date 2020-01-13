import React from 'react'
import { DOMProxy, ValueRef } from '@holoflows/kit'
import { PostInfo } from '../ui'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { ProfileIdentifier } from '../../database/type'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PostInspector, PostInspectorProps } from '../../components/InjectedComponents/PostInspector'
import { makeStyles } from '@material-ui/core'
import { TypedMessage } from '../../extension/background-script/CryptoServices/utils'

export function injectPostInspectorDefault<T extends string>(
    config: InjectPostInspectorDefaultConfig = {},
    additionalPropsToPostInspector: (classes: Record<T, string>) => Partial<PostInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostInspectorDefault = React.memo(function PostInspectorDefault(
        props: PostInfo & {
            onDecrypted: PostInspectorProps['onDecrypted']
            zipPost: PostInspectorProps['needZip']
        },
    ) {
        const { onDecrypted, zipPost, postBy, postID, postContent } = props
        const id = useValueRef(postID) || ''
        const by = useValueRef(postBy)
        const content = useValueRef(postContent)
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostInspector(classes)
        return (
            <PostInspector
                onDecrypted={onDecrypted}
                needZip={zipPost}
                postId={id}
                post={content}
                postBy={by}
                {...additionalProps}
            />
        )
    })

    const { injectionPoint, zipPost } = config
    const zipPostF = zipPost || (() => {})
    return function injectPostInspector(current: PostInfo) {
        const injectionPointDefault = () => current.rootNodeProxy.afterShadow
        const onDecrypted = (val: TypedMessage) => {
            if (val.type === 'text') current.decryptedPostContent.value = val.content
        }
        return renderInShadowRoot(
            <PostInspectorDefault
                onDecrypted={onDecrypted}
                zipPost={() => zipPostF(current.rootNodeProxy)}
                {...current}
            />,
            (injectionPoint || injectionPointDefault)(current.rootNodeProxy),
        )
    }
}

interface InjectPostInspectorDefaultConfig {
    injectionPoint?(node: DOMProxy): ShadowRoot
    zipPost?(node: DOMProxy): void
}
