import { useEffect } from 'react'
import { useAsync } from 'react-use'
import type { ValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { usePostInfoDecryptComment } from '@masknet/plugin-infra/content-script'
import { PostCommentChip } from '@masknet/injected-ui/PostCommentChip'

export interface PostCommentProps {
    comment: ValueRef<string>
    needZip(): void
}
export function PostComment(props: PostCommentProps) {
    const { needZip } = props
    const comment = useValueRef(props.comment)
    const decrypt = usePostInfoDecryptComment()

    const { value } = useAsync(async () => decrypt?.(comment), [decrypt, comment])

    useEffect(() => void (value && needZip()), [value, needZip])
    if (value) return <PostCommentChip>{value}</PostCommentChip>
    return null
}
