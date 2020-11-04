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
    Typography,
} from '@material-ui/core'
import type { Ticker, DataProvider } from '../../types'
import { formatCurrency, formatEthereumAddress } from '../../../Wallet/formatter'
import { useI18N } from '../../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            height: 266,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        table: {},
        cell: {
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1),
            whiteSpace: 'nowrap',
        },
        logo: {
            width: 18,
            height: 18,
            verticalAlign: 'bottom',
            marginRight: theme.spacing(0.5),
        },
        placeholder: {
            paddingTop: theme.spacing(10),
            borderStyle: 'none',
        },
    }),
)

export interface TickersTableProps {
    platform: DataProvider
    tickers: Ticker[]
}

export function TickersTable(props: TickersTableProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const rows = [
        t('plugin_trader_table_exchange'),
        t('plugin_trader_table_pair'),
        t('plugin_trader_table_price'),
        t('plugin_trader_table_volume'),
    ]
    const tickers = props.tickers.map((ticker, index) => (
        <TableRow key={index}>
            <TableCell className={classes.cell}>
                {ticker.logo_url ? <img className={classes.logo} src={ticker.logo_url} /> : null}
                <span>{ticker.market_name}</span>
            </TableCell>
            <TableCell className={classes.cell}>
                {(() => {
                    const formated = formatEthereumAddress(ticker.base_name, 2)
                    return (
                        <Link color="primary" target="_blank" rel="noopener noreferrer" href={ticker.trade_url}>
                            <span title={formated !== ticker.base_name ? ticker.base_name : ''}>{formated}</span>
                            <span>/</span>
                            <span>{ticker.target_name}</span>
                        </Link>
                    )
                })()}
            </TableCell>
            <TableCell className={classes.cell}>{formatCurrency(ticker.price, '$')}</TableCell>
            <TableCell className={classes.cell}>{formatCurrency(ticker.volume, '$')}</TableCell>
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
                {tickers.length ? (
                    <TableBody>{tickers}</TableBody>
                ) : (
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell} colSpan={4} style={{ borderStyle: 'none' }}>
                                <Typography className={classes.placeholder} align="center" color="textSecondary">
                                    {t('plugin_trader_no_data')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                )}
            </Table>
        </TableContainer>
    )
}
