import {
    makeStyles,
    createStyles,
    TableContainer,
    Paper,
    Table,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    Typography,
} from '@material-ui/core'
import type { DataProvider, Trending } from '../../types'
import { formatCurrency } from '../../../Wallet/formatter'

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

export interface CoinMarketTableProps {
    dataProvider: DataProvider
    trending: Trending
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const { trending } = props
    const classes = useStyles()

    return (
        <TableContainer className={classes.container} component={Paper} elevation={0}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.head} align="center">
                            <Typography color="textSecondary" variant="body2">
                                Market Cap
                            </Typography>
                        </TableCell>
                        <TableCell className={classes.head} align="center">
                            <Typography color="textSecondary" variant="body2">
                                Volume (24h)
                            </Typography>
                        </TableCell>
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.cell} align="center">
                            {formatCurrency(trending.market?.market_cap ?? 0, '$')} USD
                        </TableCell>
                        <TableCell className={classes.cell} align="center">
                            {formatCurrency(trending.market?.total_volume ?? 0, '$')} USD
                        </TableCell>
                        <TableCell className={classes.cell} align="center">
                            {formatCurrency(trending.market?.circulating_supply ?? 0, '$')} USD
                        </TableCell>
                        <TableCell className={classes.cell} align="center">
                            {formatCurrency(trending.market?.total_supply ?? 0, '$')} USD
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
