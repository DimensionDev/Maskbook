import React from 'react'
import {
    TableContainer,
    Table,
    makeStyles,
    Theme,
    createStyles,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Link,
} from '@material-ui/core'
import type { Ticker } from '../type'
import { formatCurrency, formatEthAddress } from '../../Wallet/formatter'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            height: 316,
        },
        table: {},
        cell: {
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1),
            whiteSpace: 'nowrap',
        },
        avatar: {
            width: 20,
            height: 20,
        },
    }),
)

export interface TickersTableProps {
    tickers: Ticker[]
}

export function TickersTable(props: TickersTableProps) {
    const classes = useStyles()
    const rows = ['Exchange', 'Pair', 'Price', 'Volumn']
    const tickers = props.tickers.map((ticker) => (
        <TableRow key={ticker.market_name + ticker.base_name + ticker.target_name}>
            <TableCell className={classes.cell}>
                <Link color="primary" target="_blank" rel="noopener noreferrer" href={ticker.trade_url}>
                    {ticker.market_name}
                </Link>
            </TableCell>
            <TableCell className={classes.cell}>
                {(() => {
                    const formated = formatEthAddress(ticker.base_name)
                    return (
                        <>
                            <span title={formated !== ticker.base_name ? ticker.base_name : ''}>{formated}</span>
                            <span>/</span>
                            <span>{ticker.target_name}</span>
                        </>
                    )
                })()}
            </TableCell>
            <TableCell className={classes.cell}>${formatCurrency(ticker.price)}</TableCell>
            <TableCell className={classes.cell}>${formatCurrency(ticker.volumn)}</TableCell>
        </TableRow>
    ))

    return (
        <TableContainer className={classes.container}>
            <Table className={classes.table} size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {rows.map((x) => (
                            <TableCell className={classes.cell} key={x}>
                                {x}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>{tickers}</TableBody>
            </Table>
        </TableContainer>
    )
}
