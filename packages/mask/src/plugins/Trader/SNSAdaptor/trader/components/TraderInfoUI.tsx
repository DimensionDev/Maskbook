import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { isDashboardPage } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { formatBalance, FungibleToken } from '@masknet/web3-shared-base'
import { memo } from 'react'
import { useI18N } from '../../../../../utils'
import { Box, TextField, Typography } from '@mui/material'
import { CircleLoadingAnimation, FormattedBalance } from '@masknet/shared'
import { BestTradeIcon, CircleWarningIcon } from '@masknet/icons'
import classNames from 'classnames'

// TODO: remove isDashboard after remove Dashboard page
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
    loading: {
        marginBottom: 8,
        height: 80,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
        backgroundColor: `${isDashboard ? MaskColorVar.input : theme.palette.maskColor?.bottom}!important`,
        borderRadius: 8,
        cursor: 'pointer',
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
        gap: 4,
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
        padding: 0,
        cursor: 'pointer',
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

export interface TraderInfoUIProps {
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
    loading: boolean
    providerName: string
    balance: string
    priceImpact: string
    isGreatThanSlippageSetting: boolean
    gasFee: string
    gasFeeValueUSD: string
    nativeToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export const TraderInfoUI = memo<TraderInfoUIProps>(
    ({
        loading,
        providerName,
        onClick,
        balance,
        isFocus,
        gasFee,
        gasFeeValueUSD,
        nativeToken,
        isBest,
        isGreatThanSlippageSetting,
        priceImpact,
    }) => {
        const isDashboard = isDashboardPage()

        const { t } = useI18N()
        const { classes } = useStyles({ isDashboard })

        if (loading)
            return (
                <Box className={classes.loading}>
                    <CircleLoadingAnimation />
                </Box>
            )

        return (
            <TextField
                key={providerName}
                fullWidth
                type="text"
                variant="filled"
                onClick={onClick}
                value={balance}
                InputProps={{
                    className: classNames(classes.trade, isFocus ? classes.focus : null),
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
                            <Typography className={classes.provider}>{providerName}</Typography>
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
                                        {gasFeeValueUSD === '<$0.01'
                                            ? t('plugin_trader_tx_cost_very_small', { usd: gasFeeValueUSD })
                                            : t('plugin_trader_tx_cost_usd', { usd: gasFeeValueUSD })}
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
                                        percent: priceImpact,
                                    })}
                                </Typography>
                            ) : null}
                        </>
                    ),
                }}
                inputProps={{ className: classes.input, disabled: true }}
            />
        )
    },
)

export interface DefaultTraderPlaceholderUIProps {
    nativeToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export const DefaultTraderPlaceholderUI = memo<DefaultTraderPlaceholderUIProps>(({ nativeToken }) => {
    const isDashboard = isDashboardPage()

    const { t } = useI18N()
    const { classes } = useStyles({ isDashboard })

    return (
        <TextField
            fullWidth
            type="text"
            variant="filled"
            value={0}
            InputProps={{
                className: classNames(classes.trade, classes.focus),
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
                        <Typography className={classes.provider}>DEX</Typography>

                        <Typography className={classes.cost}>
                            <Typography fontSize={14} lineHeight="20px" component="span">
                                {t('plugin_trader_gas_fee')}
                            </Typography>
                            <Typography fontSize={14} lineHeight="20px" component="span" marginLeft={0.5}>
                                <FormattedBalance
                                    value={0}
                                    decimals={nativeToken.decimals ?? 0}
                                    significant={4}
                                    symbol={nativeToken.symbol}
                                    formatter={formatBalance}
                                />
                            </Typography>
                            <Typography fontSize={14} lineHeight="20px" component="span">
                                {t('plugin_trader_tx_cost_usd', { usd: 0 })}
                            </Typography>
                        </Typography>
                    </Box>
                ),
            }}
            inputProps={{ className: classes.input, disabled: true }}
        />
    )
})
