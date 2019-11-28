import * as React from 'react'

export interface PostModalUIProps {}
export const PostModalUI = React.memo(function PostModalUI(props: PostModalUIProps) {
    return <h1>Additional Post Modal</h1>
})

export interface PostModalProps extends Partial<PostModalUIProps> {}
export function PostModal(props: PostModalProps) {
    return (
        <>
            <PostModal />
        </>
    )
}
