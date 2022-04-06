import {
    Card,
    CardContent,
    Tabs,
    Tab,
    Paper,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,
    Box,
    TablePagination,
    IconButton,
} from '@mui/material'
import {
    FirstPage as FirstPageIcon,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LastPage as LastPageIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useWindowSize } from 'react-use'
import { useEffect, useRef, useState, MouseEvent, ChangeEvent } from 'react'
import { parseTransactionHistory } from '../utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useAreaChart } from '../../hooks/useAreaChart'
import { useDimension, Dimension } from '../../hooks/useDimension'
import { useFetchToken } from '../hooks/useToken'
import type { tokenData, fpmmTransaction } from '../types'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 110,
    left: 16,
    width: 249,
    height: 134,
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    table: {
        display: 'grid',
    },
    graph: {
        display: 'block',
        color: theme.palette.text.primary,
    },
    card: {
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        backgroundColor: '#1b1b21',
    },
    tab: {
        fontFamily: 'inherit',
        color: 'white',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    row: {
        color: 'white',
    },
    cell: {
        fontFamily: 'inherit',

        color: 'white',
        borderBottom: '1px solid #393b4a',
    },
    pagination: {
        '& .MuiIconButton-root, .MuiTablePagination-select, .MuiTablePagination-, .MuiTablePagination-selectLabel': {
            color: 'white',
            fontFamily: 'inherit',
        },
        '& .MuiTablePagination-displayedRows, .MuiTablePagination-selectIcon': {
            color: 'white',
            fontFamily: 'inherit',
        },
        '& .MuiTablePagination-menuItem': {
            color: 'black',
            fontFamily: 'inherit',
        },
    },
    tCellLeft: {
        textAlign: 'left',
    },
    tCellCenter: {
        textAlign: 'center',
    },
    tCellRight: {
        textAlign: 'right',
    },
}))

interface TablePaginationActionsProps {
    count: number
    page: number
    rowsPerPage: number
    onPageChange: (event: MouseEvent<HTMLButtonElement>, newPage: number) => void
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props

    const handleFirstPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, 0)
    }

    const handleBackButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1)
    }

    const handleNextButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1)
    }

    const handleLastPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }

    return (
        <Box sx={{ flexShrink: 0, mr: 2.5 }}>
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

interface OmenHistoryViewProps {
    marketHistory: fpmmTransaction[]
    tokenId: string
}

export function OmenHistoryView(props: OmenHistoryViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const { marketHistory, tokenId } = props
    const { keys, buyData, sellData } = parseTransactionHistory(marketHistory)
    const tokenDataRes = useFetchToken(tokenId)
    const tokenObj: tokenData | null | undefined = tokenDataRes ? tokenDataRes.value : undefined
    const collateralToken = tokenObj?.registeredToken
    const tokenSymbol = collateralToken ? collateralToken.symbol : ''
    const collateralDecimals = collateralToken ? collateralToken.decimals : 0

    const rootRef = useRef<HTMLDivElement>(null)
    const buyChartRef = useRef<SVGSVGElement>(null)
    const sellChartRef = useRef<SVGSVGElement>(null)

    const { width } = useWindowSize()
    const [responsiveWidth, setResponsiveWidth] = useState(DEFAULT_DIMENSION.width)
    const [responsiveHeight, setResponsiveHeight] = useState(DEFAULT_DIMENSION.height)

    useEffect(() => {
        if (!rootRef.current) return
        setResponsiveWidth(rootRef.current.getBoundingClientRect().width || DEFAULT_DIMENSION.width)
        setResponsiveHeight(rootRef.current.getBoundingClientRect().height || DEFAULT_DIMENSION.height)
    }, [width])

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: responsiveWidth,
        height: responsiveHeight,
    }

    useDimension(buyChartRef, dimension)
    useAreaChart(
        buyChartRef,
        buyData.map(([creationTimestamp, tokenAmount]) => ({
            date: new Date(creationTimestamp),
            value: new BigNumber(tokenAmount).shiftedBy(-collateralDecimals).toNumber(),
        })),
        dimension,
        'x-omen-buy-history-area-chart',
        { color: 'green' },
    )

    useDimension(sellChartRef, dimension)
    useAreaChart(
        sellChartRef,
        sellData.map(([creationTimestamp, tokenAmount]) => ({
            date: new Date(creationTimestamp),
            value: tokenAmount,
        })),
        dimension,
        'x-omen-sell-history-area-chart',
        { color: 'red' },
    )

    // Handle reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - marketHistory.length) : 0

    const handleChangePage = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(Number.parseInt(event.target.value, 10))
        setPage(0)
    }

    return (
        <div className={classes.root} ref={rootRef}>
            <Card className={classes.card}>
                <CardContent>
                    <Tabs
                        value={tabIndex}
                        className={classes.tabs}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="secondary"
                        onChange={(_, newValue: number) => setTabIndex(newValue)}>
                        <Tab value={0} className={classes.tab} key={0} label={t('plugin_omen_activities')} />,
                        <Tab value={1} className={classes.tab} key={1} label={t('plugin_omen_graph')} />,
                    </Tabs>
                    {tabIndex === 0 ? (
                        <Table size="small" className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell key="User" align="left" variant="head" className={classes.header}>
                                        <Typography textAlign="left">{t('plugin_omen_user')}</Typography>
                                    </TableCell>
                                    <TableCell key="Action" align="left" variant="head" className={classes.header}>
                                        <Typography textAlign="left">{t('plugin_omen_action')}</Typography>
                                    </TableCell>
                                    <TableCell key="Shares" align="center" variant="head" className={classes.header}>
                                        <Typography textAlign="center">{t('plugin_omen_shares_pt')}</Typography>
                                    </TableCell>
                                    <TableCell key="Amount" align="right" variant="head" className={classes.header}>
                                        <Typography textAlign="right">
                                            {t('plugin_omen_amount')} ({tokenSymbol})
                                        </Typography>
                                    </TableCell>
                                    <TableCell key="Date" align="right" variant="head" className={classes.header}>
                                        <Typography textAlign="right">{t('plugin_omen_date_utc')}</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(rowsPerPage > 0
                                    ? marketHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : marketHistory
                                ).map((row: fpmmTransaction, index: number) => (
                                    <TableRow key={index} className={classes.row}>
                                        <TableCell>
                                            <Typography className={classes.tCellLeft}>
                                                0x...{row.user.id.slice(row.user.id.length - 4)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography className={classes.tCellLeft}>{row.transactionType}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography className={classes.tCellCenter}>
                                                {Number(
                                                    new BigNumber(row.sharesOrPoolTokenAmount)
                                                        .shiftedBy(-collateralDecimals)
                                                        .toFixed(2),
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography className={classes.tCellRight}>
                                                {Number(
                                                    new BigNumber(row.collateralTokenAmount)
                                                        .shiftedBy(-collateralDecimals)
                                                        .toFixed(2),
                                                )}{' '}
                                                {tokenSymbol}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography className={classes.tCellRight}>
                                                {new Date(keys[index]).toDateString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 69 * emptyRows }}>
                                        <TableCell colSpan={5} className={classes.cell} />
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell>
                                        <TablePagination
                                            className={classes.pagination}
                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                            colSpan={4}
                                            count={marketHistory.length}
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
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    ) : null}
                    {tabIndex === 1 ? (
                        <Paper>
                            <svg
                                className={classes.graph}
                                ref={buyChartRef}
                                width={dimension.width}
                                height={dimension.height}
                                viewBox={`0 0 ${dimension.width} ${dimension.height}`}
                                preserveAspectRatio="xMidYMid meet"
                            />
                            <svg
                                className={classes.graph}
                                ref={sellChartRef}
                                width={dimension.width}
                                height={dimension.height}
                                viewBox={`0 0 ${dimension.width} ${dimension.height}`}
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </Paper>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    )
}
