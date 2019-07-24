import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'

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
export function PostComment({ comment, postContent, postIV, needZip }: Props) {
    return (
        <AsyncComponent
            promise={() => Services.Crypto.decryptComment(postIV, postContent, comment)}
            dependencies={[postIV, postContent, comment]}
            awaitingComponent={null}
            completeComponent={result =>
                result.data ? (needZip(), <PostCommentDecrypted>{result.data}</PostCommentDecrypted>) : null
            }
            failedComponent={null}
        />
    )
}
