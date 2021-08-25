import { Box } from '@material-ui/core'
import { usePosts } from '../../hooks/usePosts'
import { PostHistoryRow } from './PostHistoryRow'
import { memo } from 'react'

interface PostHistoryProps {
    useIds: string[]
    network: string
}

export const PostHistory = memo(({ useIds, network }: PostHistoryProps) => {
    const { value: posts } = usePosts(network, useIds)
    console.log(posts)
    return (
        <Box>
            {posts?.map((x) => (
                <PostHistoryRow post={x} key={x.url} />
            ))}
        </Box>
    )
})
