import { memo } from 'react'
import { TableFooter, TablePagination, TableRow } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()({
    spacer: {
        flex: 0,
    },
    toolbar: {
        minHeight: 'unset',
        paddingLeft: 16,
    },
    actions: {
        marginLeft: 0,
    },
})

export interface TableListPaginationProps {
    handlePrevClick: () => void
    handleNextClick: () => void
    prevDisabled: boolean
    nextDisabled: boolean
    page: number
    pageCount: number
}

export const TableListPagination = memo(
    ({ handlePrevClick, handleNextClick, prevDisabled, nextDisabled, page, pageCount }: TableListPaginationProps) => {
        const { classes } = useStyles()
        return (
            <TableFooter>
                <TableRow>
                    <TablePagination
                        rowsPerPage={pageCount}
                        rowsPerPageOptions={[pageCount]}
                        count={-1}
                        page={page}
                        classes={classes}
                        onPageChange={() => {}}
                        labelDisplayedRows={() => null}
                        backIconButtonProps={{
                            onClick: handlePrevClick,
                            size: 'small',
                            disabled: prevDisabled,
                        }}
                        nextIconButtonProps={{
                            onClick: handleNextClick,
                            size: 'small',
                            disabled: nextDisabled,
                        }}
                    />
                </TableRow>
            </TableFooter>
        )
    },
)
