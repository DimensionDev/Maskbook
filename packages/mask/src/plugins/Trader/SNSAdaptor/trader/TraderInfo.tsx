import { memo, useMemo } from 'react'
import type { TradeInfo } from '../../types'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { createNativeToken, formatBalance, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Box, CircularProgress, TextField, Typography } from '@mui/material'
import { resolveTradeProviderName } from '../../pipes'
import { FormattedBalance } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import classnames from 'classnames'
import { BestTradeIcon } from '@masknet/icons'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import { TradeProvider } from '@masknet/public-api'
import BigNumber from 'bignumber.js'
import { useNativeTokenPrice } from '../../../Wallet/hooks/useTokenPrice'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    trade: {
        marginBottom: 8,
        padding: 10,
        backgroundColor: `${isDashboard ? MaskColorVar.input : MaskColorVar.twitterBottom}!important`,
        border: `1px solid ${isDashboard ? MaskColorVar.lineLight : MaskColorVar.twitterBorderLine}`,
        borderRadius: 8,
        cursor: 'pointer',
        position: 'relative',
    },
    provider: {
        color: theme.palette.text.primary,
        fontSize: 19,
        lineHeight: '27px',
        fontWeight: 600,
        wordBreak: 'keep-all',
    },
    cost: {
        color: isDashboard ? MaskColorVar.normalText : MaskColorVar.twitterSecond,
        fontSize: 14,
        lineHeight: '20px',
        marginTop: 12,
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        textAlign: 'right',
        fontWeight: 500,
        color: theme.palette.text.primary,
        lineHeight: '30px',
        fontSize: 24,
        cursor: 'pointer',
        padding: '25px 12px 8px 0',
        width: 'auto',
    },
    focus: {
        border: `1px solid ${theme.palette.primary.main}`,
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
    const { t } = useI18N()
    const isDashboard = location.href.includes('dashboard.html')
    const { classes } = useStyles({ isDashboard })
    const { targetChainId } = TargetChainIdContext.useContainer()

    //#region refresh pools
    const { loading: updateBalancerPoolsLoading } = useAsyncRetry(async () => {
        // force update balancer's pools each time user enters into the swap tab
        if (trade.provider === TradeProvider.BALANCER) await PluginTraderRPC.updatePools(true, targetChainId)
    }, [trade.provider, targetChainId])
    //#endregion

    const nativeToken = createNativeToken(targetChainId)
    const tokenPrice = useNativeTokenPrice(targetChainId)

    const gasFee = useMemo(() => {
        return trade.gas.value && gasPrice
            ? new BigNumber(gasPrice).multipliedBy(trade.gas.value).integerValue().toFixed()
            : 0
    }, [trade.gas?.value, gasPrice])

    const feeValueUSD = useMemo(
        () => (gasFee ? new BigNumber(formatWeiToEther(gasFee).times(tokenPrice).toFixed(2).toString()) : '0'),
        [gasFee, tokenPrice],
    )

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
                                    {t('plugin_trader_tx_cost_usd', { usd: feeValueUSD })}
                                </Typography>
                            </Typography>
                        ) : null}
                    </Box>
                ),
                endAdornment: isBest ? <BestTradeIcon className={classes.best} /> : null,
            }}
            inputProps={{ className: classes.input, disabled: true }}
        />
    )
})
