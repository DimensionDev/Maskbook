import { Box, Stack, TablePagination } from '@material-ui/core'
import { usePostHistory } from '../../hooks/usePostHistory'
import { PostHistoryRow } from './PostHistoryRow'
import { memo, useState } from 'react'
import { Placeholder } from './Placeholder'

interface PostHistoryProps {
    useIds: string[]
    network: string
}

const DEFAULT_PAGE_SIZE = 3

export const PostHistory = memo(({ useIds, network }: PostHistoryProps) => {
    const [page, setPage] = useState(0)
    const { value, error, loading } = usePostHistory(network, page, DEFAULT_PAGE_SIZE)

    if (!value?.length) return <Placeholder network={network} />

    return (
        <Stack justifyContent="space-between" height="100%">
            <Box flex={1}>
                {value?.map((x) => (
                    <PostHistoryRow post={x} key={x.url} />
                ))}
            </Box>
            {!loading && !error && !!value?.length ? (
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
                            disabled: value.length < DEFAULT_PAGE_SIZE,
                            size: 'small',
                        }}
                    />
                </Stack>
            ) : null}
        </Stack>
    )
})
