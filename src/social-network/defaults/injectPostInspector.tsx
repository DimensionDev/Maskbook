import React from 'react'
import { DOMProxy, ValueRef } from '@holoflows/kit'
import { PostInfo } from '../ui'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PersonIdentifier } from '../../database/type'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PostInspector } from '../../components/InjectedComponents/PostInspector'

export function injectPostInspectorDefault(config: InjectPostInspectorDefaultConfig = {}) {
    const { injectionPoint, zipPost } = config
    const zipPostDefault = () => {}
    return function injectPostInspector(current: PostInfo, node: DOMProxy) {
        const injectionPointDefault = () => node.afterShadow
        const onDecrypted = (val: string) => (current.decryptedPostContent.value = val)
        return renderInShadowRoot(
            <PostDecryptUI
                postID={current.postID}
                postBy={current.postBy}
                onDecrypted={onDecrypted}
                postContent={current.postContent}
                zipPost={() => (zipPost || zipPostDefault)(node)}
            />,
            (injectionPoint || injectionPointDefault)(node),
        )
    }
}

export interface InjectPostInspectorDefaultConfig {
    injectionPoint?(node: DOMProxy): ShadowRoot
    zipPost?(node: DOMProxy): void
}
function PostDecryptUI(props: {
    onDecrypted: (val: string) => string
    zipPost: () => void
    postID: ValueRef<string | null>
    postBy: ValueRef<PersonIdentifier>
    postContent: ValueRef<string>
}) {
    const { onDecrypted, zipPost, postBy, postID, postContent } = props
    const id = useValueRef(postID)
    const by = useValueRef(postBy)
    const content = useValueRef(postContent)
    return <PostInspector onDecrypted={onDecrypted} needZip={zipPost} postId={id || ''} post={content} postBy={by} />
}
