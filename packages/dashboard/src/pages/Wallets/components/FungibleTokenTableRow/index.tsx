import { memo } from 'react'
import { Box, Button, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { FormattedCurrency, TokenIcon, WalletIcon } from '@masknet/shared'
import { useChainContext, useNetworkDescriptors, useNetworkContext } from '@masknet/web3-hooks-base'
import { CurrencyType, formatBalance, formatCurrency, getTokenUSDValue } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useDashboardI18N } from '../../../../locales/index.js'
import { ChangeNetworkTip } from './ChangeNetworkTip.js'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    symbol: {
        marginLeft: 14,
        fontSize: theme.typography.pxToRem(14),
        maxWidth: '100px',
        textOverflow: 'ellipsis',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    row: {
        '&:hover': {
            backgroundColor: theme.palette.background.default,
        },
    },
    cell: {
        padding: theme.spacing(2),
        border: 'none',
    },
    button: {
        color: theme.palette.mode === 'dark' ? getMaskColor(theme).white : getMaskColor(theme).primary,
        '&:disabled': {
            color: theme.palette.mode === 'dark' ? getMaskColor(theme).white : getMaskColor(theme).primary,
        },
    },
    chainIcon: {
        position: 'absolute',
        right: -9,
        bottom: 0,
        height: 18,
        width: 18,
        border: `1px solid ${theme.palette.background.default}`,
        borderRadius: '50%',
    },
    tip: {
        padding: theme.spacing(1),
        background: '#111432',
    },
    tipArrow: {
        color: '#111432',
    },
}))

export interface TokenTableRowProps {
    asset: Web3Helper.FungibleAssetAll
    onSwap(asset: Web3Helper.FungibleAssetAll): void
    onSend(asset: Web3Helper.FungibleAssetAll): void
}

export const FungibleTokenTableRow = memo<TokenTableRowProps>(({ asset, onSend, onSwap }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { chainId } = useChainContext()
    const networkDescriptors = useNetworkDescriptors()
    const { pluginID: currentPluginId } = useNetworkContext()
    const isOnCurrentChain = chainId === asset.chainId

    return (
        <TableRow className={classes.row}>
            <TableCell className={classes.cell} align="center" variant="body">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box position="relative">
                        <TokenIcon
                            className={classes.icon}
                            address={asset.address}
                            name={asset.name}
                            chainId={asset.chainId}
                            logoURL={asset.logoURL || asset.logoURL}
                            size={36}
                        />
                        <Box className={classes.chainIcon}>
                            <WalletIcon
                                size={16}
                                mainIcon={networkDescriptors.find((x) => x.chainId === asset.chainId)?.icon}
                            />
                        </Box>
                    </Box>
                    <Typography className={classes.symbol}>{asset.symbol}</Typography>
                </Box>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>{formatBalance(asset.balance, asset.decimals, 6)}</Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>
                    {asset.price?.[CurrencyType.USD]
                        ? formatCurrency(Number.parseFloat(asset.price[CurrencyType.USD] ?? ''))
                        : '-'}
                </Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center">
                <Typography>
                    {getTokenUSDValue(asset.value) < 0.01 ? (
                        '<$0.01'
                    ) : (
                        <FormattedCurrency
                            value={getTokenUSDValue(asset.value).toFixed(2)}
                            sign="USD"
                            formatter={formatCurrency}
                        />
                    )}
                </Typography>
            </TableCell>
            {currentPluginId === NetworkPluginID.PLUGIN_EVM && (
                <TableCell sx={{ minWidth: '200px' }} className={classes.cell} align="center" variant="body">
                    <Tooltip
                        disableHoverListener={isOnCurrentChain}
                        disableTouchListener
                        title={<ChangeNetworkTip chainId={asset.chainId} />}
                        placement="top"
                        classes={{ tooltip: classes.tip, arrow: classes.tipArrow }}
                        arrow>
                        <span>
                            <Button
                                size="small"
                                style={!isOnCurrentChain ? { pointerEvents: 'none' } : {}}
                                disabled={!isOnCurrentChain}
                                variant="outlined"
                                color="secondary"
                                sx={{ marginRight: 1 }}
                                className={classes.button}
                                onClick={() => onSend(asset)}>
                                {t.wallets_balance_Send()}
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip
                        disableHoverListener={isOnCurrentChain || asset.chainId !== ChainId.Conflux}
                        disableTouchListener
                        title={<ChangeNetworkTip chainId={asset.chainId} />}
                        placement="top"
                        classes={{ tooltip: classes.tip, arrow: classes.tipArrow }}
                        arrow>
                        <span>
                            <Button
                                size="small"
                                style={
                                    !isOnCurrentChain || asset.chainId === ChainId.Conflux
                                        ? { pointerEvents: 'none' }
                                        : {}
                                }
                                disabled={!isOnCurrentChain || asset.chainId === ChainId.Conflux}
                                variant="outlined"
                                color="secondary"
                                onClick={() => onSwap(asset)}
                                className={classes.button}>
                                {t.wallets_balance_Swap()}
                            </Button>
                        </span>
                    </Tooltip>
                </TableCell>
            )}
        </TableRow>
    )
})

FungibleTokenTableRow.displayName = 'FungibleTokenTableRow'
