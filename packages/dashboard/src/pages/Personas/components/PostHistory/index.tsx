import { Box, Pagination, Stack } from '@material-ui/core'
import { usePosts } from '../../hooks/usePosts'
import { PostHistoryRow } from './PostHistoryRow'
import { memo, useState } from 'react'

interface PostHistoryProps {
    useIds: string[]
    network: string
}

export const PostHistory = memo(({ useIds, network }: PostHistoryProps) => {
    const [page, setPage] = useState(1)
    const { value } = usePosts(network, useIds, page)

    if (!value) return <Box>Placeholder</Box>

    return (
        <Stack justifyContent="space-between" height="100%">
            <Box flex={1}>
                {value.data?.map((x) => (
                    <PostHistoryRow post={x} key={x.url} />
                ))}
            </Box>
            {value.pages > 1 ? (
                <Box>
                    <Pagination
                        variant="outlined"
                        count={value.pages}
                        color="primary"
                        shape="rounded"
                        onChange={(_, page) => setPage(page)}
                    />
                </Box>
            ) : null}
        </Stack>
    )
})
