import { memo } from 'react'
import type { TradeInfo } from '../../types'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { formatBalance } from '../../../../../../web3-shared/evm'
import { Box, CircularProgress, TextField, Typography } from '@mui/material'
import { resolveTradeProviderName } from '../../pipes'
import { FormattedBalance } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import classnames from 'classnames'
import { BestTradeIcon } from '@masknet/icons'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import { TradeProvider } from '@masknet/public-api'

const useStyles = makeStyles()({
    trade: {
        marginTop: 8,
        padding: 10,
        backgroundColor: `${MaskColorVar.twitterBottom}!important`,
        border: `1px solid ${MaskColorVar.twitterBorderLine}`,
        borderRadius: 8,
        cursor: 'pointer',
        position: 'relative',
    },
    provider: {
        color: MaskColorVar.twitterButton,
        fontSize: 19,
        lineHeight: '27px',
        fontWeight: 600,
        wordBreak: 'keep-all',
    },
    cost: {
        color: MaskColorVar.twitterSecond,
        fontSize: 14,
        lineHeight: '20px',
        marginTop: 12,
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        textAlign: 'right',
        fontWeight: 500,
        color: MaskColorVar.twitterButton,
        lineHeight: '30px',
        fontSize: 24,
        cursor: 'pointer',
        padding: '25px 12px 8px 0',
    },
    focus: {
        border: `1px solid ${MaskColorVar.blue}`,
    },
    best: {
        position: 'absolute',
        top: -12,
        right: 12,
    },
})

export interface TraderInfoProps {
    trade: TradeInfo
    isBest?: boolean
    isFocus?: boolean
    onClick: () => void
}

export const TraderInfo = memo<TraderInfoProps>(({ trade, isBest, onClick, isFocus }) => {
    const { t } = useI18N()
    const { classes } = useStyles()

    //#region refresh pools
    const { loading: updateBalancerPoolsLoading } = useAsyncRetry(async () => {
        // force update balancer's pools each time user enters into the swap tab
        if (trade.provider === TradeProvider.BALANCER) await PluginTraderRPC.updatePools(true)
    }, [trade.provider])
    //#endregion

    if ((trade.loading && trade.value) || updateBalancerPoolsLoading)
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
                        <Typography className={classes.cost}>
                            {t('plugin_trader_tx_cost')}
                            <Typography component="span" marginLeft={0.5}>
                                <FormattedBalance
                                    value={trade.value?.fee ?? 0}
                                    decimals={trade.value?.inputToken?.decimals ?? 0}
                                    significant={4}
                                    symbol={trade.value?.inputToken?.symbol}
                                />
                            </Typography>
                        </Typography>
                    </Box>
                ),
                endAdornment: isBest ? <BestTradeIcon className={classes.best} /> : null,
            }}
            inputProps={{ className: classes.input, disabled: true }}
        />
    )
})
