import React from 'react'
import { DOMProxy } from '@holoflows/kit'
import { PostInfo } from '../ui'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PostInspector, PostInspectorProps } from '../../components/InjectedComponents/PostInspector'
import { makeStyles } from '@material-ui/core'
import { PostIdentifier } from '../../database/type'

export function injectPostInspectorDefault<T extends string>(
    config: InjectPostInspectorDefaultConfig = {},
    additionalPropsToPostInspector: (classes: Record<T, string>) => Partial<PostInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostInspectorDefault = React.memo(function PostInspectorDefault(
        props: PostInfo & {
            onDecrypted: PostInspectorProps['onDecrypted']
            onDecryptedRaw: PostInspectorProps['onDecryptedRaw']
            zipPost: PostInspectorProps['needZip']
        },
    ) {
        const { onDecrypted, zipPost, postBy, postID, postContent, onDecryptedRaw } = props
        const _id = useValueRef(postID)
        const by = useValueRef(postBy)
        const id = _id ? new PostIdentifier(by, _id) : PostIdentifier.unknown
        const content = useValueRef(postContent)
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostInspector(classes)
        return (
            <PostInspector
                onDecryptedRaw={onDecryptedRaw}
                onDecrypted={onDecrypted}
                needZip={zipPost}
                postId={id}
                post={content}
                postBy={by}
                AddToKeyStoreProps={{ failedComponent: null }}
                {...additionalProps}
            />
        )
    })

    const { injectionPoint, zipPost } = config
    const zipPostF = zipPost || (() => {})
    return function injectPostInspector(current: PostInfo) {
        const injectionPointDefault = () => current.rootNodeProxy.afterShadow
        return renderInShadowRoot(
            <PostInspectorDefault
                onDecrypted={val => (current.decryptedPostContent.value = val)}
                onDecryptedRaw={val => (current.decryptedPostContentRaw.value = val)}
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
