import { Stack } from '@mui/material'
import { PostCommentChip } from '@masknet/injected-ui/PostCommentChip'

export const meta = {
    title: 'PostCommentChip',
    description:
        'The chip shown under a post once Mask decrypts an encrypted comment (packages/injected-ui/src/PostCommentChip.tsx). The container (PostComments.tsx) owns the actual decryption and only renders this once it resolves.',
}

export default function PostCommentChipDemo() {
    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <PostCommentChip>This is a decrypted comment.</PostCommentChip>
        </Stack>
    )
}
