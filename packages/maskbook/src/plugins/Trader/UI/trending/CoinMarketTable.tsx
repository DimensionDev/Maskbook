import {
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import { DataProvider, Trending } from '../../types'
import { FormattedCurrency } from '@masknet/shared'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    container: {
        borderRadius: 0,
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    table: {},
    head: {
        padding: 0,
        border: 'none',
    },
    cell: {
        whiteSpace: 'nowrap',
        border: 'none',
    },
}))

export interface CoinMarketTableProps {
    dataProvider: DataProvider
    trending: Trending
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const { trending, dataProvider } = props
    const classes = useStyles()

    return (
        <TableContainer className={classes.container} component={Paper} elevation={0}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <TableCell className={classes.head} align="center">
                                <Typography color="textSecondary" variant="body2">
                                    Market Cap
                                </Typography>
                            </TableCell>
                        ) : null}
                        <TableCell className={classes.head} align="center">
                            <Typography color="textSecondary" variant="body2">
                                Volume (24h)
                            </Typography>
                        </TableCell>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <>
                                <TableCell className={classes.head} align="center">
                                    <Typography color="textSecondary" variant="body2">
                                        Circulating Supply
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.head} align="center">
                                    <Typography color="textSecondary" variant="body2">
                                        Total Supply
                                    </Typography>
                                </TableCell>
                            </>
                        ) : null}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <TableCell className={classes.cell} align="center">
                                <FormattedCurrency sign="$" symbol="USD" value={trending.market?.market_cap ?? 0} />
                            </TableCell>
                        ) : null}
                        <TableCell className={classes.cell} align="center">
                            <FormattedCurrency sign="$" symbol="USD" value={trending.market?.total_volume ?? 0} />
                        </TableCell>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <>
                                <TableCell className={classes.cell} align="center">
                                    <FormattedCurrency
                                        value={trending.market?.circulating_supply ?? 0}
                                        symbol={trending.coin.symbol}
                                    />
                                </TableCell>
                                <TableCell className={classes.cell} align="center">
                                    <FormattedCurrency
                                        value={trending.market?.total_supply ?? 0}
                                        symbol={trending.coin.symbol}
                                    />
                                </TableCell>
                            </>
                        ) : null}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
