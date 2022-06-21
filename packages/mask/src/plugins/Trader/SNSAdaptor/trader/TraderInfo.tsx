import { memo, useMemo } from 'react'
import type { TradeInfo } from '../../types'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { createNativeToken, formatPercentage, formatUSD, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Box, CircularProgress, TextField, Typography } from '@mui/material'
import { resolveTradeProviderName } from '../../pipes'
import { FormattedBalance } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { multipliedBy, NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../utils'
import classnames from 'classnames'
import { BestTradeIcon, CircleWarningIcon } from '@masknet/icons'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import { TradeProvider } from '@masknet/public-api'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'
import { useNativeTokenPrice } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    trade: {
        marginBottom: 8,
        padding: 10,
        backgroundColor: `${isDashboard ? MaskColorVar.input : theme.palette.maskColor?.bottom}!important`,
        border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
        borderRadius: 8,
        alignItems: 'flex-start',
        cursor: 'pointer',
        position: 'relative',
        minHeight: 82,
    },
    warningText: {
        fontSize: 14,
        lineHeight: '18px',
        position: 'absolute',
        bottom: 10,
        right: 10,
        color: isDashboard ? MaskColorVar.redMain : theme.palette.maskColor?.danger,
        display: 'flex',
        alignItems: 'center',
    },
    provider: {
        color: isDashboard ? theme.palette.text.primary : theme.palette.maskColor?.main,
        fontSize: 18,
        lineHeight: '36px',
        fontWeight: 700,
        wordBreak: 'keep-all',
    },
    cost: {
        color: isDashboard ? MaskColorVar.normalText : theme.palette.maskColor?.second,
        fontSize: 14,
        lineHeight: '18px',
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        textAlign: 'right',
        fontWeight: 700,
        color: theme.palette.text.primary,
        lineHeight: 1.2,
        fontSize: 30,
        cursor: 'pointer',
        padding: '0 10px 0 0',
        width: 'auto',
    },
    focus: {
        border: `2px solid ${isDashboard ? theme.palette.primary.main : theme.palette.maskColor?.primary}!important`,
    },
    best: {
        position: 'absolute',
        top: -12,
        right: 12,
    },
}))

export interface TraderInfoProps {
    trade: TradeInfo
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
}

export const TraderInfo = memo<TraderInfoProps>(({ trade, gasPrice, isBest, onClick, isFocus }) => {
    const isDashboard = isDashboardPage()

    const { t } = useI18N()
    const { classes } = useStyles({ isDashboard })
    const { targetChainId } = TargetChainIdContext.useContainer()

    // #region refresh pools
    useAsyncRetry(async () => {
        // force update balancer's pools each time user enters into the swap tab
        if (trade.provider === TradeProvider.BALANCER) await PluginTraderRPC.updatePools(true, targetChainId)
    }, [trade.provider, targetChainId])
    // #endregion

    const nativeToken = createNativeToken(targetChainId)
    const { value: tokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })

    const gasFee = useMemo(() => {
        return trade.gas.value && gasPrice ? multipliedBy(gasPrice, trade.gas.value).integerValue().toFixed() : 0
    }, [trade.gas?.value, gasPrice])

    const feeValueUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(tokenPrice))
    }, [gasFee, tokenPrice])

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(trade.value?.priceImpact)

    if (trade.loading)
        return (
            <Box className={classes.trade} display="flex" justifyContent="center" style={{ padding: 24 }}>
                <CircularProgress />
            </Box>
        )

    if (!trade.value) return null

    return (
        <TextField
            key={trade.provider}
            fullWidth
            type="text"
            variant="filled"
            onClick={onClick}
            value={formatBalance(trade.value?.outputAmount ?? 0, trade.value?.outputToken?.decimals, 2)}
            InputProps={{
                className: classnames(classes.trade, isFocus ? classes.focus : null),
                disableUnderline: true,
                startAdornment: (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            width: '100%',
                        }}>
                        <Typography className={classes.provider}>{resolveTradeProviderName(trade.provider)}</Typography>
                        {gasFee ? (
                            <Typography className={classes.cost}>
                                <Typography fontSize={14} lineHeight="20px" component="span">
                                    {t('plugin_trader_gas_fee')}
                                </Typography>
                                <Typography fontSize={14} lineHeight="20px" component="span" marginLeft={0.5}>
                                    <FormattedBalance
                                        value={gasFee}
                                        decimals={nativeToken.decimals ?? 0}
                                        significant={4}
                                        symbol={nativeToken.symbol}
                                        formatter={formatBalance}
                                    />
                                </Typography>
                                <Typography fontSize={14} lineHeight="20px" component="span">
                                    {feeValueUSD === '<$0.01'
                                        ? t('plugin_trader_tx_cost_very_small', { usd: feeValueUSD })
                                        : t('plugin_trader_tx_cost_usd', { usd: feeValueUSD })}
                                </Typography>
                            </Typography>
                        ) : null}
                    </Box>
                ),
                endAdornment: (
                    <>
                        {isBest ? <BestTradeIcon className={classes.best} /> : null}
                        {isGreatThanSlippageSetting ? (
                            <Typography className={classes.warningText}>
                                <CircleWarningIcon style={{ width: 18, height: 18 }} />
                                {t('plugin_trader_price_image_value', {
                                    percent: formatPercentage(trade.value.priceImpact),
                                })}
                            </Typography>
                        ) : null}
                    </>
                ),
            }}
            inputProps={{ className: classes.input, disabled: true }}
        />
    )
})
