import { memo } from 'react'
import { Box, Button, TableCell, TableRow, Typography } from '@material-ui/core'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { FormattedCurrency, TokenIcon } from '@masknet/shared'
import { Asset, CurrencyType, formatBalance, formatCurrency, getTokenUSDValue, pow10 } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    symbol: {
        marginLeft: 14,
        fontSize: theme.typography.pxToRem(14),
    },
    cell: {
        padding: theme.spacing(2),
        border: 'none',
    },
    button: {
        color: theme.palette.mode === 'dark' ? getMaskColor(theme).white : getMaskColor(theme).primary,
    },
}))

export interface TokenTableRowProps {
    asset: Asset
    onSwap(): void
    onSend(): void
}

export const TokenTableRow = memo<TokenTableRowProps>(({ asset, onSend, onSwap }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()

    return (
        <TableRow>
            <TableCell className={classes.cell} align="center" variant="body">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon
                        classes={{ icon: classes.icon }}
                        address={asset.token.address}
                        name={asset.token.name}
                        chainId={asset.token.chainId}
                        logoURI={asset.token.logoURI}
                        AvatarProps={{ sx: { width: 36, height: 36 } }}
                    />
                    <Typography className={classes.symbol}>{asset.token.symbol}</Typography>
                </Box>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>{new BigNumber(formatBalance(asset.balance, asset.token.decimals)).toFixed(6)}</Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>
                    {asset.price?.[CurrencyType.USD]
                        ? new BigNumber(asset.price[CurrencyType.USD]).gt(pow10(-6))
                            ? formatCurrency(Number.parseFloat(asset.price[CurrencyType.USD]), '$')
                            : '<0.000001'
                        : '-'}
                </Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center">
                <Typography>
                    {getTokenUSDValue(asset) < 0.01 ? (
                        '<0.01'
                    ) : (
                        <FormattedCurrency value={getTokenUSDValue(asset).toFixed(2)} sign="$" />
                    )}
                </Typography>
            </TableCell>
            <TableCell sx={{ minWidth: '200px' }} className={classes.cell} align="center" variant="body">
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ marginRight: 1 }}
                    className={classes.button}
                    onClick={onSend}>
                    {t.wallets_balance_Send()}
                </Button>
                <Button variant="outlined" color="secondary" onClick={onSwap} className={classes.button}>
                    {t.wallets_balance_Swap()}
                </Button>
            </TableCell>
        </TableRow>
    )
})
