import { memo } from 'react'
import { createStyles, IconButton, makeStyles, TableFooter, TablePagination, TableRow } from '@material-ui/core'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'

const useStyles = makeStyles((theme) => {
    return createStyles({
        spacer: {
            flex: 0,
        },
    })
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
        const classes = useStyles()
        return (
            <TableFooter>
                <TableRow>
                    <TablePagination
                        rowsPerPage={pageCount}
                        rowsPerPageOptions={[pageCount]}
                        count={-1}
                        page={page}
                        classes={{ spacer: classes.spacer }}
                        onPageChange={() => {}}
                        labelDisplayedRows={() => null}
                        ActionsComponent={() => {
                            return (
                                <div>
                                    <IconButton disabled={prevDisabled} onClick={handlePrevClick}>
                                        <KeyboardArrowLeft />
                                    </IconButton>
                                    <IconButton disabled={nextDisabled} onClick={handleNextClick}>
                                        <KeyboardArrowRight />
                                    </IconButton>
                                </div>
                            )
                        }}
                    />
                </TableRow>
            </TableFooter>
        )
    },
)
