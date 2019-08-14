import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { Payload } from '../../utils/type-transform/Payload'

const useStyle = makeStyles({
    root: {
        height: 'auto',
        padding: '6px',
    },
    label: {
        whiteSpace: 'initial',
    },
})
export function PostCommentDecrypted(props: React.PropsWithChildren<{}>) {
    const style = useStyle()
    return (
        <>
            <Chip classes={style} icon={<Lock />} label={props.children} color="secondary" />
        </>
    )
}
interface Props {
    postIV: string
    postContent: string
    comment: string
    needZip(): void
}
export function PostCommentUI({ comment, postContent, postIV, needZip }: Props) {
    return (
        <AsyncComponent
            promise={() => {
                if (!postIV || !postContent) return Promise.resolve('')
                return Services.Crypto.decryptComment(postIV, postContent, comment)
            }}
            dependencies={[postIV, postContent, comment]}
            awaitingComponent={null}
            completeComponent={result =>
                result.data ? (needZip(), <PostCommentDecrypted>{result.data}</PostCommentDecrypted>) : null
            }
            failedComponent={null}
        />
    )
}

// TODO: Merge PostComment and PostCommentUI
export function PostComment(props: PostCommentProps) {
    const postContent = useValueRef(props.decryptedPostContent)
    const comment = useValueRef(props.commentContent)
    return (
        <PostCommentUI
            needZip={props.needZip}
            comment={comment}
            postContent={postContent}
            postIV={props.postPayload.value ? props.postPayload.value.iv : ''}
        />
    )
}
interface PostCommentProps {
    needZip(): void
    decryptedPostContent: ValueRef<string>
    commentContent: ValueRef<string>
    postPayload: ValueRef<Payload | null>
}
