import { Box, Pagination, Stack } from '@material-ui/core'
import { usePostHistory } from '../../hooks/usePostHistory'
import { PostHistoryRow } from './PostHistoryRow'
import { memo, useState } from 'react'
import { Placeholder } from './Placeholder'

interface PostHistoryProps {
    useIds: string[]
    network: string
}

export const PostHistory = memo(({ useIds, network }: PostHistoryProps) => {
    const [page, setPage] = useState(1)
    const { value } = usePostHistory(network, useIds, page)

    if (!value?.data.length) return <Placeholder network={network} />

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
