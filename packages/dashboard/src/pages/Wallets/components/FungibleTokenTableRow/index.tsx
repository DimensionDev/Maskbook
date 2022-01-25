import { memo, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Box, Button, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { FormattedCurrency, TokenIcon, WalletIcon } from '@masknet/shared'
import {
    CurrencyType,
    NetworkPluginID,
    useChainId,
    useNetworkDescriptors,
    usePluginIDContext,
    useWeb3State,
    Web3Plugin,
} from '@masknet/plugin-infra'
import { useDashboardI18N } from '../../../../locales'
import { ChangeNetworkTip } from './ChangeNetworkTip'
import { getTokenUSDValue } from '../../utils/getTokenUSDValue'
import { pow10 } from '@masknet/web3-shared-base'

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
        right: -8,
        bottom: 0,
        height: 16,
        width: 16,
    },
    tip: {
        padding: theme.spacing(1),
        background: '#111432',
    },
    tipArrow: {
        color: '#111432',
    },
    networkIcon: {
        border: `1px solid ${theme.palette.background.default}`,
        borderRadius: '50%',
    },
}))

export interface TokenTableRowProps {
    asset: Web3Plugin.Asset<Web3Plugin.FungibleToken>
    onSwap(): void
    onSend(): void
}

export const FungibleTokenTableRow = memo<TokenTableRowProps>(({ asset, onSend, onSwap }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId()
    const { Utils } = useWeb3State()
    const networkDescriptors = useNetworkDescriptors()
    const currentPluginId = usePluginIDContext()
    const isOnCurrentChain = useMemo(() => currentChainId === asset.token.chainId, [asset, currentChainId])

    return (
        <TableRow className={classes.row}>
            <TableCell className={classes.cell} align="center" variant="body">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box position="relative">
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            address={asset.token.address}
                            name={asset.token.name}
                            chainId={asset.token.chainId}
                            logoURI={asset.logoURI || asset.token.logoURI}
                            AvatarProps={{ sx: { width: 36, height: 36 } }}
                        />
                        <Box className={classes.chainIcon}>
                            <WalletIcon
                                classes={{ networkIcon: classes.networkIcon }}
                                size={16}
                                networkIcon={networkDescriptors.find((x) => x.chainId === asset.token.chainId)?.icon}
                            />
                        </Box>
                    </Box>
                    <Typography className={classes.symbol}>{asset.token.symbol}</Typography>
                </Box>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>
                    {new BigNumber(Utils?.formatBalance?.(asset.balance, asset.token.decimals) ?? '').toFixed(6)}
                </Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>
                    {asset.price?.[CurrencyType.USD]
                        ? new BigNumber(asset.price[CurrencyType.USD] ?? '').gt(pow10(-6))
                            ? Utils?.formatCurrency?.(Number.parseFloat(asset.price[CurrencyType.USD] ?? ''), '$')
                            : '<0.000001'
                        : '-'}
                </Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center">
                <Typography>
                    {getTokenUSDValue(asset.value) < 0.01 ? (
                        '<0.01'
                    ) : (
                        <FormattedCurrency
                            value={getTokenUSDValue(asset.value).toFixed(2)}
                            sign="$"
                            formatter={Utils?.formatCurrency}
                        />
                    )}
                </Typography>
            </TableCell>
            {currentPluginId === NetworkPluginID.PLUGIN_EVM && (
                <TableCell sx={{ minWidth: '200px' }} className={classes.cell} align="center" variant="body">
                    <Tooltip
                        disableHoverListener={isOnCurrentChain}
                        disableTouchListener
                        title={<ChangeNetworkTip chainId={asset.token.chainId} />}
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
                                onClick={onSend}>
                                {t.wallets_balance_Send()}
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip
                        disableHoverListener={isOnCurrentChain}
                        disableTouchListener
                        title={<ChangeNetworkTip chainId={asset.token.chainId} />}
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
                                onClick={onSwap}
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
