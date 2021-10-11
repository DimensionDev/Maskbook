import { memo } from 'react'
import { Box, Button, TableCell, TableRow, Tooltip, Typography } from '@material-ui/core'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainIcon, FormattedCurrency, TokenIcon } from '@masknet/shared'
import {
    Asset,
    CurrencyType,
    formatBalance,
    formatCurrency,
    getTokenUSDValue,
    pow10,
    useChainId,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useDashboardI18N } from '../../../../locales'
import { ChangeNetworkTip } from './ChangeNetworkTip'

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
    disabledButton: {
        opacity: 0.6,
        cursor: 'default',
        '&:hover': {
            boxShadow: 'none',
            outline: 'none',
        },
    },
    chainIcon: {
        position: 'absolute',
        right: -8,
        bottom: 0,
        height: 16,
        width: 16,
    },
    tip: {
        padding: theme.spacing(1),
        background: MaskColorVar.mainBackground,
    },
    tipArrow: {
        color: MaskColorVar.mainBackground,
    },
}))

export interface TokenTableRowProps {
    asset: Asset
    onSwap(): void
    onSend(): void
}

export const TokenTableRow = memo<TokenTableRowProps>(({ asset, onSend, onSwap }) => {
    const t = useDashboardI18N()
    const currentChainId = useChainId()
    const { classes } = useStyles()

    const isOnCurrentChain = currentChainId === asset.token.chainId

    return (
        <TableRow>
            <TableCell className={classes.cell} align="center" variant="body">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box position="relative">
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            address={asset.token.address}
                            name={asset.token.name}
                            chainId={asset.token.chainId}
                            logoURI={asset.token.logoURI}
                            AvatarProps={{ sx: { width: 36, height: 36 } }}
                        />
                        <Box className={classes.chainIcon}>
                            <ChainIcon chainId={asset.token.chainId} size={16} />
                        </Box>
                    </Box>
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
                <Tooltip
                    disableHoverListener={isOnCurrentChain}
                    title={<ChangeNetworkTip chainId={asset.token.chainId} />}
                    placement="top"
                    classes={{ tooltip: classes.tip, arrow: classes.tipArrow }}
                    arrow>
                    <Button
                        size="small"variant="outlined"
                        color="secondary"
                        sx={{ marginRight: 1 }}
                        className={`${classes.button} ${!isOnCurrentChain ? classes.disabledButton : ''}`}
                        onClick={() => isOnCurrentChain && onSend()}>
                        {t.wallets_balance_Send()}
                    </Button>
                </Tooltip>
                <Tooltip
                    disableHoverListener={isOnCurrentChain}
                    title={<ChangeNetworkTip chainId={asset.token.chainId} />}
                    placement="top"
                    classes={{ tooltip: classes.tip, arrow: classes.tipArrow }}
                    arrow>
                    <Button
                       size="small" variant="outlined"
                        color="secondary"
                        onClick={() => isOnCurrentChain && onSwap()}
                        className={`${classes.button} ${!isOnCurrentChain ? classes.disabledButton : ''}`}>
                        {t.wallets_balance_Swap()}
                    </Button>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
})
