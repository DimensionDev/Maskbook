import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { Payload } from '../../utils/type-transform/Payload'
import { ChipProps } from '@material-ui/core/Chip'
import { useStylesExtends } from '../custom-ui-helper'

const useStyle = makeStyles({
    root: {
        height: 'auto',
        padding: '6px',
    },
    label: {
        whiteSpace: 'initial',
    },
})
export type PostCommentDecryptedProps = React.PropsWithChildren<{ ChipProps?: ChipProps }>
export function PostCommentDecrypted(props: PostCommentDecryptedProps) {
    const chipClasses = useStylesExtends(useStyle(), props.ChipProps || {})
    return (
        <>
            <Chip icon={<Lock />} label={props.children} color="secondary" {...props.ChipProps} classes={chipClasses} />
        </>
    )
}
export interface PostCommentProps {
    decryptedPostContentRaw: ValueRef<string>
    postPayload: ValueRef<Payload | null>
    comment: ValueRef<string>
    needZip(): void
    successComponentProps?: PostCommentDecryptedProps
    successComponent?: React.ComponentType<PostCommentDecryptedProps>
    waitingComponent?: React.ComponentType
    failedComponent?: React.ComponentType<{ error: Error }>
}
export function PostComment(props: PostCommentProps) {
    const decryptedPostContent = useValueRef(props.decryptedPostContentRaw)
    const comment = useValueRef(props.comment)
    const postPayload = useValueRef(props.postPayload)
    const postIV = postPayload ? postPayload.iv : ''

    const Success = props.successComponent || PostCommentDecrypted
    return (
        <AsyncComponent
            promise={() => {
                if (!postIV || !decryptedPostContent) return Promise.reject('')
                return Services.Crypto.decryptComment(postIV, decryptedPostContent, comment).then(e => {
                    if (e === null) throw new Error('Decryption failed.')
                    return e
                })
            }}
            dependencies={[postIV, decryptedPostContent, comment]}
            awaitingComponent={props.waitingComponent || null}
            completeComponent={result => {
                props.needZip()
                return <Success>{result.data}</Success>
            }}
            failedComponent={props.failedComponent || null}
        />
    )
}
