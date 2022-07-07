import {
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FormattedCurrency } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { coinFormatter, formatCurrency } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../utils'
import type { Ticker } from '../../types'
import { DataProvider } from '@masknet/public-api'
import { formatElapsed } from '../../../Wallet/formatter'
import { ReactNode, useMemo } from 'react'
import { compact, pick } from 'lodash-unified'
import { TrendingCoinType } from '@masknet/web3-providers'

const useStyles = makeStyles()((theme) => ({
    container: {
        maxHeight: 266,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    cell: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.maskColor.bottom,
        border: 'none',
        '&:not(:first-child)': {
            textAlign: 'center',
        },
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
    coinType: TrendingCoinType
}

type FungibleTokenCells = 'exchange' | 'pair' | 'price' | 'volume' | 'updated'
type NonFungibleTokenCells = 'marketplace' | 'volume' | 'floor_price' | 'sales'
type Cells = FungibleTokenCells | NonFungibleTokenCells

export function TickersTable({ dataProvider, tickers, coinType }: TickersTableProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const isNFT = coinType === TrendingCoinType.NonFungible
    const isUniswap = dataProvider === DataProvider.UNISWAP_INFO

    const headCellMap: Record<Cells, string> = {
        volume: t('plugin_trader_table_volume'),
        updated: t('plugin_trader_table_updated'),
        exchange: t('plugin_trader_table_exchange'),
        pair: t('plugin_trader_table_pair'),
        price: t('plugin_trader_table_price'),
        marketplace: t('plugin_trader_marketplace'),
        floor_price: t('plugin_trader_floor_price'),
        sales: t('plugin_trader_sales'),
    }

    const columns: Cells[] = useMemo(() => {
        if (isNFT) return ['marketplace', 'sales', 'volume', 'floor_price']
        return compact(['exchange', 'pair', isUniswap ? null : 'price', 'volume', 'updated'])
    }, [t, isNFT, isUniswap])
    const tickerRows = tickers.map((ticker, index) => {
        const price = ticker.price ?? ticker.floor_price
        const volume = isNFT ? ticker.volume_24h : ticker.volume
        const formatter = isNFT ? coinFormatter : formatCurrency
        const marketplaceOrExchange = (
            <Stack direction="row" alignItems="center">
                {ticker.logo_url ? <img className={classes.logo} src={ticker.logo_url} /> : null}
                <Typography component="span">{ticker.market_name}</Typography>
            </Stack>
        )
        const cellMap: Record<Cells, ReactNode> = {
            marketplace: marketplaceOrExchange,
            volume: volume ? <FormattedCurrency value={volume} formatter={formatter} /> : null,
            floor_price: price ? <FormattedCurrency value={price} formatter={formatter} /> : null,
            updated: ticker.updated ? formatElapsed(ticker.updated.getTime()) : null,
            exchange: marketplaceOrExchange,
            pair: (() => {
                if (!ticker.base_name || !ticker.target_name) return null
                const formatted = formatEthereumAddress(ticker.base_name, 2)
                return (
                    <Link
                        color={(theme) => theme.palette.maskColor?.primary}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={ticker.trade_url}>
                        <Typography component="span" title={formatted !== ticker.base_name ? ticker.base_name : ''}>
                            {formatted}
                        </Typography>
                        <span>/</span>
                        <Typography component="span">{formatEthereumAddress(ticker.target_name, 2)}</Typography>
                    </Link>
                )
            })(),
            price: price ? <FormattedCurrency value={price} formatter={formatter} /> : null,
            sales: ticker.sales_24 ?? null,
        }

        const cells = Object.entries(pick(cellMap, columns)).map(([name, cell]) => (
            <TableCell key={name} className={classes.cell}>
                {cell}
            </TableCell>
        ))
        return <TableRow key={index}>{cells}</TableRow>
    })

    const headCells = Object.values(pick(headCellMap, columns))

    return (
        <TableContainer className={classes.container}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {headCells.map((x) => (
                            <TableCell className={classes.cell} key={x}>
                                {x}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {columns.length ? (
                        tickerRows
                    ) : (
                        <TableRow>
                            <TableCell
                                className={classes.cell}
                                colSpan={columns.length}
                                style={{ borderStyle: 'none' }}>
                                <Typography className={classes.placeholder} align="center" color="textSecondary">
                                    {t('plugin_trader_no_data')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
