import React from 'react'
import type { DOMProxy } from '@holoflows/kit'
import type { PostInfo } from '../ui'
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
            zipPost: PostInspectorProps['needZip']
        },
    ) {
        const { onDecrypted, zipPost, postBy, postID, postContent } = props
        const _id = useValueRef(postID)
        const by = useValueRef(postBy)
        const id = _id ? new PostIdentifier(by, _id) : PostIdentifier.unknown
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
                AddToKeyStoreProps={{ failedComponent: null }}
                {...additionalProps}
            />
        )
    })

    const { zipPost } = config
    const zipPostF = zipPost || (() => {})
    return function injectPostInspector(current: PostInfo) {
        return renderInShadowRoot(
            <PostInspectorDefault
                onDecrypted={(typed, raw) => {
                    current.decryptedPostContent.value = typed
                    current.decryptedPostContentRaw.value = raw
                }}
                zipPost={() => zipPostF(current.rootNodeProxy)}
                {...current}
            />,
            {
                shadow: () => current.rootNodeProxy.afterShadow,
                normal: () => current.rootNodeProxy.after,
                concurrent: true,
            },
        )
    }
}

interface InjectPostInspectorDefaultConfig {
    zipPost?(node: DOMProxy): void
}
