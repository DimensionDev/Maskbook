import { memo, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Box, Button, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { FormattedCurrency, TokenIcon, WalletIcon } from '@masknet/shared'
import {
    useChainId,
    useNetworkDescriptors,
    useCurrentWeb3NetworkPluginID,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import {
    CurrencyType,
    formatBalance,
    formatCurrency,
    FungibleAsset,
    NetworkPluginID,
    pow10,
    toFixed,
} from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useDashboardI18N } from '../../../../locales'
import { ChangeNetworkTip } from './ChangeNetworkTip'
import { getTokenUSDValue } from '../../utils/getTokenUSDValue'

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
    asset: FungibleAsset<
        Web3Helper.Definition[NetworkPluginID]['ChainId'],
        Web3Helper.Definition[NetworkPluginID]['SchemaType']
    >
    onSwap(): void
    onSend(): void
}

export const FungibleTokenTableRow = memo<TokenTableRowProps>(({ asset, onSend, onSwap }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId()
    const { Others } = useWeb3State()
    const networkDescriptors = useNetworkDescriptors()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const isOnCurrentChain = useMemo(() => currentChainId === asset.chainId, [asset, currentChainId])

    return (
        <TableRow className={classes.row}>
            <TableCell className={classes.cell} align="center" variant="body">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box position="relative">
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            address={asset.address}
                            name={asset.name}
                            chainId={asset.chainId}
                            logoURL={asset.logoURL || asset.logoURL}
                            AvatarProps={{ sx: { width: 36, height: 36 } }}
                        />
                        <Box className={classes.chainIcon}>
                            <WalletIcon
                                size={16}
                                networkIcon={networkDescriptors.find((x) => x.chainId === asset.chainId)?.icon}
                            />
                        </Box>
                    </Box>
                    <Typography className={classes.symbol}>{asset.symbol}</Typography>
                </Box>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>{toFixed(formatBalance(asset.balance, asset.decimals) ?? '', 6)}</Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center" variant="body">
                <Typography>
                    {asset.price?.[CurrencyType.USD]
                        ? new BigNumber(asset.price[CurrencyType.USD] ?? '').gt(pow10(-6))
                            ? formatCurrency(Number.parseFloat(asset.price[CurrencyType.USD] ?? ''))
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
                                onClick={onSend}>
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
