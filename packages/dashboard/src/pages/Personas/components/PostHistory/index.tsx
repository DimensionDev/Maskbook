import { Box, Stack, TablePagination } from '@mui/material'
import { usePostHistory } from '../../hooks/usePostHistory.js'
import { PostHistoryRow } from './PostHistoryRow.js'
import { memo, useState } from 'react'
import { Placeholder } from './Placeholder.js'

interface PostHistoryProps {
    network: string
}

const DEFAULT_PAGE_SIZE = 20

export const PostHistory = memo(({ network }: PostHistoryProps) => {
    const [page, setPage] = useState(0)
    const { value: posts, error, loading } = usePostHistory(network, page, DEFAULT_PAGE_SIZE)

    if (!posts?.length && !loading) return <Placeholder network={network} />

    return (
        <Stack justifyContent="space-between" height="100%">
            <Box flex={1} mt={1}>
                {posts?.map((x) => (
                    <PostHistoryRow network={network} post={x} key={x.url} />
                ))}
            </Box>
            {!loading && !error && !!posts?.length ? (
                <Stack justifyContent="center" direction="row">
                    <TablePagination
                        sx={{ display: 'inline-block' }}
                        count={-1}
                        component="div"
                        onPageChange={() => {}}
                        page={page}
                        rowsPerPage={DEFAULT_PAGE_SIZE}
                        rowsPerPageOptions={[DEFAULT_PAGE_SIZE]}
                        labelDisplayedRows={() => null}
                        backIconButtonProps={{
                            onClick: () => setPage((prev) => prev - 1),
                            size: 'small',
                            disabled: page === 0,
                        }}
                        nextIconButtonProps={{
                            onClick: () => setPage((prev) => prev + 1),
                            disabled: posts.length < DEFAULT_PAGE_SIZE,
                            size: 'small',
                        }}
                    />
                </Stack>
            ) : null}
        </Stack>
    )
})
