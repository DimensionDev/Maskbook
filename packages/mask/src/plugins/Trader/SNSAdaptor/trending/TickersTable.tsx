import { type ReactNode, useContext } from 'react'
import { pick } from 'lodash-es'
import {
    Box,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material'
import { useSNSThemeMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { FormattedCurrency } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatCurrency, formatElapsed } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../utils/index.js'
import type { Ticker } from '../../types/index.js'
import { TrendingViewContext } from './context.js'

const useStyles = makeStyles<{ snsThemeMode?: string; isPopper?: boolean }>()((theme, { snsThemeMode, isPopper }) => ({
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
        background: snsThemeMode === 'dim' && !isPopper ? '#15202b' : theme.palette.maskColor.bottom,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
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
    pair: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: 100,
        width: 100,
    },
}))

export interface TickersTableProps {
    tickers: Ticker[]
}

type Cells = 'exchange' | 'pair' | 'price' | 'volume' | 'updated'

export function TickersTable({ tickers }: TickersTableProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const snsThemeMode = useSNSThemeMode(theme)
    const { isCollectionProjectPopper, isTokenTagPopper } = useContext(TrendingViewContext)
    const { classes } = useStyles({ snsThemeMode, isPopper: isCollectionProjectPopper || isTokenTagPopper })

    const headCellMap: Record<Cells, string> = {
        volume: t('plugin_trader_table_volume'),
        updated: t('plugin_trader_table_updated'),
        exchange: t('plugin_trader_table_exchange'),
        pair: t('plugin_trader_table_pair'),
        price: t('plugin_trader_table_price'),
    }

    const columns: Cells[] = ['exchange', 'pair', 'price', 'volume', 'updated']
    const tickerRows = tickers.map((ticker, index) => {
        const price = ticker.price ?? ticker.floor_price
        const volume = ticker.volume
        const currency = 'USD'
        const marketplaceOrExchange = (
            <Stack direction="row" alignItems="center">
                {ticker.logo_url ? <img className={classes.logo} src={ticker.logo_url} /> : null}
                <Typography component="span">{ticker.market_name}</Typography>
            </Stack>
        )
        const cellMap: Record<Cells, ReactNode> = {
            volume: volume ? <FormattedCurrency value={volume} sign={currency} formatter={formatCurrency} /> : null,
            updated: ticker.updated ? formatElapsed(ticker.updated.getTime()) : null,
            exchange: marketplaceOrExchange,
            pair: (() => {
                if (!ticker.base_name || !ticker.target_name) return null
                const formatted = formatEthereumAddress(ticker.base_name, 2)
                const basename = formatted !== ticker.base_name ? ticker.base_name : ''
                const targetName = formatEthereumAddress(ticker.target_name, 2)

                return (
                    <ShadowRootTooltip
                        placement="top-start"
                        disableInteractive
                        PopperProps={{
                            disablePortal: true,
                        }}
                        disableHoverListener={basename.length + targetName.length < 9}
                        title={`${formatted} / ${formatEthereumAddress(ticker.target_name, 2)}`}
                        arrow>
                        <Box className={classes.pair}>
                            <Link
                                color={(theme) => theme.palette.maskColor.primary}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={ticker.trade_url}>
                                <Typography
                                    component="span"
                                    title={formatted !== ticker.base_name ? ticker.base_name : ''}>
                                    {formatted}
                                </Typography>
                                <span>/</span>
                                <Typography component="span">{formatEthereumAddress(ticker.target_name, 2)}</Typography>
                            </Link>
                        </Box>
                    </ShadowRootTooltip>
                )
            })(),
            price: price ? <FormattedCurrency value={price} sign={currency} formatter={formatCurrency} /> : null,
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
