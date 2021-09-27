import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import { apyFormatter, liquidityFormatter, shortenApy } from '../utils'
import { useI18N } from '../../../utils'
import { BASE_URL } from '../constants'
import { makeStyles } from '@masknet/theme'
import type { Investable } from '../types'
import {
    Box,
    Button,
    Table,
    TableSortLabel,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
    Paper,
    IconButton,
} from '@material-ui/core'

import {
    FirstPage as FirstPageIcon,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LastPage as LastPageIcon,
} from '@mui/icons-material'

type Order = 'asc' | 'desc'

interface TablePaginationActionsProps {
    count: number
    page: number
    rowsPerPage: number
    onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void
}

interface HeadCell {
    id: string
    label: string
}

const headCells: readonly HeadCell[] = [
    {
        id: 'investables',
        label: 'investables',
    },
    {
        id: 'apy',
        label: 'apy',
    },
    {
        id: 'liquidity',
        label: 'liquidity',
    },
    {
        id: 'action',
        label: 'action',
    },
]

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props

    const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, 0)
    }

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1)
    }

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1)
    }

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page">
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page">
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    )
}

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,Arial,"sans-serif"',
        backgroundColor: '#232535',
        color: 'white',
        borderRadius: 0,
    },
    head: {
        borderBottom: '3px solid #393b4a',
    },
    row: {
        color: 'white',
    },
    cell: {
        fontFamily: 'Muli,Helvetica,Arial,"sans-serif"',

        color: 'white',
        borderBottom: '1px solid #393b4a',
    },
    sort: {
        color: 'white  !important',
        '& .MuiTableSortLabel-icon': {
            fill: 'white',
        },
    },
    pagination: {
        '& .MuiIconButton-root, .MuiTablePagination-select, .MuiTablePagination-, .MuiTablePagination-selectLabel': {
            color: 'white',
            fontFamily: 'Muli,Helvetica,Arial,"sans-serif"',
        },
        '& .MuiTablePagination-displayedRows, .MuiTablePagination-selectIcon': {
            color: 'white',
            fontFamily: 'Muli,Helvetica,Arial,"sans-serif"',
        },
        '& .MuiTablePagination-menuItem': {
            color: 'black',
            fontFamily: 'Muli,Helvetica,Arial,"sans-serif"',
        },
    },
    invest: {
        maxWidth: theme.spacing(12),
        fontFamily: 'inherit',
        backgroundColor: 'white',
        border: '1px solid #393b4a',
        borderRadius: '6px',
        color: '#212529',
        '&:hover': {
            backgroundColor: 'white',
            color: '#212529',
            border: '1px solid #393b4a',
        },
    },
}))

export function InvestmentsView(props: any) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const investables = props.investables
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(5)

    const [order, setOrder] = React.useState<Order>('desc')
    const [orderBy, setOrderBy] = React.useState<string>('apy')

    const sortOrder = (a: any, b: any) => {
        return order === 'asc' ? a - b : b - a
    }

    investables.sort((a: any, b: any) => sortOrder(a[orderBy], b[orderBy]))

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - investables.length) : 0

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    return (
        <TableContainer component={Paper} className={classes.root}>
            <Table aria-label="custom pagination table">
                <TableHead>
                    <TableRow className={classes.head}>
                        {headCells.map((headCell) => {
                            return (
                                <TableCell className={classes.cell} key={headCell.id}>
                                    {headCell.id === 'apy' || headCell.id === 'liquidity' ? (
                                        <TableSortLabel
                                            className={classes.sort}
                                            active={orderBy === headCell.id}
                                            onClick={(e) => handleRequestSort(e, headCell.id)}
                                            direction={orderBy === headCell.id ? order : 'asc'}>
                                            {t(`plugin_furucombo_${headCell.label}`).toUpperCase()}
                                        </TableSortLabel>
                                    ) : (
                                        t(`plugin_furucombo_${headCell.label}`).toUpperCase()
                                    )}
                                </TableCell>
                            )
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(rowsPerPage > 0
                        ? investables.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : investables
                    ).map((row: Investable) => (
                        <TableRow key={row.token.address} className={classes.row}>
                            <TableCell
                                className={classes.cell}
                                component="th"
                                scope="row"
                                style={{ width: 200, height: 36 }}>
                                {row.name}
                            </TableCell>
                            <TableCell className={classes.cell}>{shortenApy(apyFormatter(row.apy))}</TableCell>
                            <TableCell className={classes.cell}>{liquidityFormatter(row.liquidity, 1)}</TableCell>
                            <TableCell className={classes.cell}>
                                <Button
                                    className={classes.invest}
                                    size="small"
                                    href={`${BASE_URL}/${row.category}/${row.chainId}/${row.token.address}`}
                                    target="_blank">
                                    {t('plugin_furucombo_invest')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 69 * emptyRows }}>
                            <TableCell colSpan={6} className={classes.cell} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            className={classes.pagination}
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={4}
                            count={investables.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                    'aria-label': 'rows per page',
                                },
                                native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    )
}
