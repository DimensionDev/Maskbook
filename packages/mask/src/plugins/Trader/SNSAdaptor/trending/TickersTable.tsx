import { Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FormattedCurrency } from '@masknet/shared'
import { formatEthereumAddress, formatCurrency } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import type { Ticker } from '../../types'
import { DataProvider } from '@masknet/public-api'
import { formatElapsed } from '../../../Wallet/formatter'

const useStyles = makeStyles()((theme) => ({
    container: {
        maxHeight: 266,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
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
        paddingBottom: theme.spacing(10),
        borderStyle: 'none',
    },
}))

export interface TickersTableProps {
    dataProvider: DataProvider
    tickers: Ticker[]
}

export function TickersTable(props: TickersTableProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const rows = [
        t('plugin_trader_table_exchange'),
        t('plugin_trader_table_pair'),
        props.dataProvider !== DataProvider.UNISWAP_INFO ? t('plugin_trader_table_price') : null,
        t('plugin_trader_table_volume'),
        t('plugin_trader_table_updated'),
    ]
    const tickers = props.tickers.map((ticker, index) => (
        <TableRow key={index}>
            <TableCell className={classes.cell}>
                {ticker.logo_url ? <img className={classes.logo} src={ticker.logo_url} /> : null}
                <span>{ticker.market_name}</span>
            </TableCell>
            <TableCell className={classes.cell}>
                {(() => {
                    const formatted = formatEthereumAddress(ticker.base_name, 2)
                    return (
                        <Link color="primary" target="_blank" rel="noopener noreferrer" href={ticker.trade_url}>
                            <span title={formatted !== ticker.base_name ? ticker.base_name : ''}>{formatted}</span>
                            <span>/</span>
                            <span>{formatEthereumAddress(ticker.target_name, 2)}</span>
                        </Link>
                    )
                })()}
            </TableCell>
            {ticker.price ? (
                <TableCell className={classes.cell}>
                    <FormattedCurrency value={ticker.price} sign="$" formatter={formatCurrency} />
                </TableCell>
            ) : null}
            <TableCell className={classes.cell}>
                <FormattedCurrency value={ticker.volume} sign="$" formatter={formatCurrency} />
            </TableCell>
            <TableCell className={classes.cell}>{formatElapsed(ticker.updated.getTime())}</TableCell>
        </TableRow>
    ))

    return (
        <TableContainer className={classes.container}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {rows.map((x) =>
                            x ? (
                                <TableCell className={classes.cell} key={x}>
                                    {x}
                                </TableCell>
                            ) : null,
                        )}
                    </TableRow>
                </TableHead>
                {tickers.length ? (
                    <TableBody>{tickers}</TableBody>
                ) : (
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell} colSpan={5} style={{ borderStyle: 'none' }}>
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
