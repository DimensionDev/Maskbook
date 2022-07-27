import { FormattedBalance, FormattedCurrency, InjectedDialog, TokenIcon } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { makeStyles, MaskColorVar, parseColor } from '@masknet/theme'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { PluginWalletStatusBar, useI18N } from '../../../../../utils'
import type { TradeComputed } from '../../../types'
import type BigNumber from 'bignumber.js'
import {
    formatBalance,
    formatCurrency,
    FungibleToken,
    multipliedBy,
    formatPercentage,
    isZero,
} from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { Alert, alpha, Box, Button, DialogActions, DialogContent, dialogTitleClasses, Typography } from '@mui/material'
import { ArrowDownward } from '@mui/icons-material'
import { CircleWarningIcon, InfoIcon, RetweetIcon, WarningTriangleIcon } from '@masknet/icons'
import { ONE_BIPS, MIN_SLIPPAGE, MAX_SLIPPAGE } from '../../../constants'
import { useUpdateEffect } from 'react-use'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    section: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '16px 0',
        '& > p': {
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
        },
    },
    title: {
        color: isDashboard ? theme.palette.text.primary : theme.palette.maskColor?.second,
    },
    description: {
        color: isDashboard ? theme.palette.text.primary : theme.palette.maskColor?.main,
    },
    card: {
        borderRadius: 12,
        padding: 12,
        background: `${isDashboard ? MaskColorVar.primaryBackground2 : theme.palette.maskColor?.input}!important`,
        border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
        ['& > div']: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    },
    label: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor?.second,
    },
    symbol: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 8,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    amount: {
        fontSize: 30,
        lineHeight: 1.2,
        fontWeight: 700,
        color: theme.palette.maskColor?.main,
    },
    tokenIcon: {
        width: 30,
        height: 30,
    },
    reverseWrapper: {
        display: 'flex',
        justifyContent: 'center',
    },
    reverse: {
        marginTop: -8,
        border: `2px solid ${theme.palette.maskColor?.bottom}`,
        backgroundColor: isDashboard ? MaskColorVar.lightBackground : theme.palette.background.default,
        width: 32,
        height: 32,
        borderRadius: 99,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reverseIcon: {
        stroke: isDashboard ? `${theme.palette.text.primary}!important` : theme.palette.maskColor?.main,
    },
    alert: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
    },
    warning: {
        backgroundColor: isDashboard
            ? theme.palette.warning.main
            : parseColor(theme.palette.maskColor?.warn).setAlpha(0.1).toRgbString(),
        color: isDashboard ? theme.palette.warning.main : theme.palette.maskColor?.warn,
    },
    info: {
        backgroundColor: isDashboard ? theme.palette.background.default : theme.palette.maskColor?.bg,
        color: isDashboard ? theme.palette.text.primary : theme.palette.maskColor?.main,
    },
    error: {
        backgroundColor: isDashboard
            ? MaskColorVar.redMain
            : parseColor(theme.palette.maskColor?.danger).setAlpha(0.1).toRgbString(),
        color: isDashboard ? theme.palette.common.white : theme.palette.maskColor?.danger,
    },
    action: {
        marginRight: 0,
        padding: 0,
        minWidth: 88,
    },
    infoIcon: {
        color: isDashboard ? MaskColorVar.twitterInfo : theme.palette.maskColor?.main,
    },
    content: {
        padding: 16,
        minHeight: 458,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        padding: 0,
        position: 'sticky',
        bottom: 0,
        boxShadow: `0px 0px 20px ${alpha(
            theme.palette.maskColor.shadowBottom,
            theme.palette.mode === 'dark' ? 0.12 : 0.05,
        )}`,
    },
    accept: {
        backgroundColor: isDashboard
            ? MaskColorVar.primary.alpha(0.1)
            : parseColor(theme.palette.maskColor?.primary).setAlpha(0.1).toRgbString(),
        color: isDashboard ? MaskColorVar.primary : theme.palette.maskColor?.primary,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: '16px',
        padding: '10px 16px',
        borderRadius: 20,
    },
    danger: {
        color: `${isDashboard ? MaskColorVar.redMain : theme.palette.maskColor?.danger}!important`,
    },
    edit: {
        fontSize: 14,
        lineHeight: '18px',
        color: isDashboard ? theme.palette.primary.main : theme.palette.maskColor?.primary,
        marginRight: 4,
        fontWeight: 700,
        cursor: 'pointer',
    },
    alertMessage: {
        padding: 0,
    },
    alertIcon: {
        padding: 0,
    },
    dialog: {
        [`.${dialogTitleClasses.root}`]: {
            // 'row !important' is not assignable to FlexDirection
            flexDirection: 'row !important' as 'row',
            '& > p': {
                justifyContent: 'center !important',
            },
        },
    },
}))

export interface ConfirmDialogUIProps {
    open: boolean
    currentSlippage: number
    inputTokenPrice: number
    outputTokenPrice: number
    gasFee: string
    gasFeeUSD: string
    isGreatThanSlippageSetting: boolean
    trade: TradeComputed
    nativeToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    inputToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    outputToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    onClose: () => void
    openSettingDialog: () => void
    onConfirm: () => void
}

export const ConfirmDialogUI = memo<ConfirmDialogUIProps>(
    ({
        open,
        onClose,
        trade,
        currentSlippage,
        inputTokenPrice,
        nativeToken,
        inputToken,
        outputToken,
        outputTokenPrice,
        gasFee,
        gasFeeUSD,
        openSettingDialog,
        isGreatThanSlippageSetting,
        onConfirm,
    }) => {
        const { t } = useI18N()
        const isDashboard = isDashboardPage()
        const { classes, cx } = useStyles({ isDashboard })

        const [cacheTrade, setCacheTrade] = useState<TradeComputed | undefined>()
        const [priceUpdated, setPriceUpdated] = useState(false)
        const [priceReversed, setPriceReversed] = useState(false)

        // #region detect price changing
        const [executionPrice, setExecutionPrice] = useState<BigNumber | undefined>(cacheTrade?.executionPrice)
        useEffect(() => {
            if (open) setExecutionPrice(undefined)
        }, [open])
        // #endregion

        const staled = !!(executionPrice && !executionPrice.isEqualTo(cacheTrade?.executionPrice ?? 0))

        const alertTip = useMemo(() => {
            if (currentSlippage < MIN_SLIPPAGE && !isGreatThanSlippageSetting)
                return (
                    <Alert
                        classes={{ message: classes.alertMessage, icon: classes.alertIcon }}
                        className={cx(classes.alert, classes.warning)}
                        icon={<WarningTriangleIcon />}
                        severity="warning">
                        {t('plugin_trader_price_impact_warning_tips')}
                    </Alert>
                )
            else if (currentSlippage > MAX_SLIPPAGE && !isGreatThanSlippageSetting) {
                return (
                    <Alert
                        classes={{ message: classes.alertMessage, icon: classes.alertIcon }}
                        className={cx(classes.alert, classes.warning)}
                        icon={<WarningTriangleIcon />}
                        severity="warning">
                        {t('plugin_trader_confirm_tips')}
                    </Alert>
                )
            } else if (isGreatThanSlippageSetting && cacheTrade?.priceImpact) {
                return (
                    <Alert
                        classes={{ message: classes.alertMessage, icon: classes.alertIcon }}
                        className={cx(classes.alert, classes.error)}
                        icon={<CircleWarningIcon className={classes.danger} />}
                        severity="error">
                        {t('plugin_trader_price_impact_too_high_tips', {
                            impact: formatPercentage(cacheTrade?.priceImpact),
                        })}
                    </Alert>
                )
            }

            return null
        }, [currentSlippage, isGreatThanSlippageSetting, cacheTrade?.priceImpact])

        const onAccept = useCallback(() => {
            setPriceUpdated(false)
            setCacheTrade(trade)
            setExecutionPrice(trade.executionPrice)
        }, [trade])

        // #region update cache trade and price updated state
        useUpdateEffect(() => {
            // when dialog has been closed, reset state
            if (!open) {
                setPriceUpdated(false)
                setCacheTrade(undefined)
                return
            }
            if (!cacheTrade) {
                setCacheTrade(trade)
            }
            // when output amount or minimum received has been changed
            else if (!priceUpdated && !cacheTrade.outputAmount.isEqualTo(trade.outputAmount)) {
                setPriceUpdated(true)
            }
        }, [open, trade, cacheTrade, priceUpdated])
        // #endregion

        if (!cacheTrade) return null

        const { inputAmount, outputAmount } = cacheTrade

        return (
            <InjectedDialog
                open={open}
                onClose={onClose}
                title={t('plugin_trader_confirm_swap')}
                className={classes.dialog}>
                <DialogContent className={classes.content}>
                    <Box className={classes.card}>
                        <Box>
                            <Typography className={classes.label}>{t('plugin_trader_swap_from')}</Typography>
                            <Typography className={classes.label}>
                                ~
                                <FormattedCurrency
                                    value={multipliedBy(
                                        formatBalance(inputAmount.toFixed(), inputToken.decimals),
                                        inputTokenPrice,
                                    ).toFixed(2)}
                                    formatter={formatCurrency}
                                />
                            </Typography>
                        </Box>
                        <Box>
                            <Typography component="div" className={classes.symbol}>
                                <TokenIcon
                                    classes={{ icon: classes.tokenIcon }}
                                    address={inputToken.address}
                                    logoURL={inputToken.logoURL}
                                />
                                {inputToken.symbol}
                            </Typography>
                            <Typography className={classes.amount}>
                                <FormattedBalance
                                    value={inputAmount.toFixed() ?? '0'}
                                    decimals={inputToken.decimals}
                                    significant={6}
                                    formatter={formatBalance}
                                />
                            </Typography>
                        </Box>
                    </Box>
                    <Box className={classes.reverseWrapper}>
                        <Box className={classes.reverse}>
                            <ArrowDownward className={classes.reverseIcon} />
                        </Box>
                    </Box>
                    <Box className={classes.card} mt={-1}>
                        <Box>
                            <Typography className={classes.label}>{t('plugin_trader_swap_receive')}</Typography>
                            <Typography className={classes.label}>
                                ~
                                <FormattedCurrency
                                    value={multipliedBy(
                                        formatBalance(outputAmount.toFixed(), outputToken.decimals),
                                        outputTokenPrice,
                                    ).toFixed(2)}
                                    formatter={formatCurrency}
                                />
                            </Typography>
                        </Box>
                        <Box>
                            <Typography component="div" className={classes.symbol}>
                                <TokenIcon
                                    classes={{ icon: classes.tokenIcon }}
                                    address={outputToken.address}
                                    logoURL={outputToken.logoURL}
                                />
                                {outputToken.symbol}
                            </Typography>
                            <Typography className={classes.amount}>
                                <FormattedBalance
                                    value={outputAmount.toFixed() ?? '0'}
                                    decimals={outputToken.decimals}
                                    significant={6}
                                    formatter={formatBalance}
                                />
                            </Typography>
                        </Box>
                    </Box>
                    <Box className={classes.section}>
                        <Typography className={classes.title}>{t('plugin_trader_tab_price')}</Typography>
                        <Typography className={classes.description}>
                            {priceReversed ? (
                                <span>
                                    <span>1 {outputToken.symbol}</span>
                                    {' = '}
                                    <span>
                                        {formatBalance(
                                            inputAmount
                                                .dividedBy(outputAmount)
                                                .shiftedBy(outputToken.decimals - inputToken.decimals)
                                                .shiftedBy(inputToken.decimals)
                                                .integerValue(),
                                            inputToken.decimals,
                                            6,
                                        )}
                                    </span>
                                    {inputToken.symbol}
                                </span>
                            ) : (
                                <span>
                                    <span>1 {inputToken.symbol}</span>
                                    {' = '}
                                    <span>
                                        {formatBalance(
                                            outputAmount
                                                .dividedBy(inputAmount)
                                                .shiftedBy(inputToken.decimals - outputToken.decimals)
                                                .shiftedBy(outputToken.decimals)
                                                .integerValue(),
                                            outputToken.decimals,
                                            6,
                                        )}{' '}
                                        {outputToken.symbol}
                                    </span>
                                </span>
                            )}
                            <RetweetIcon
                                style={{ marginLeft: 4, cursor: 'pointer' }}
                                onClick={() => setPriceReversed((x) => !x)}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography className={classes.title}>
                            {t('plugin_trader_confirm_slippage_tolerance')}
                        </Typography>
                        <Typography className={classes.description}>
                            <Typography component="span" className={classes.edit} onClick={openSettingDialog}>
                                {t('edit')}
                            </Typography>
                            {currentSlippage / 100}%
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography className={classes.title}>{t('plugin_trader_price_impact')}</Typography>
                        <Typography className={isGreatThanSlippageSetting ? classes.danger : classes.description}>
                            {cacheTrade?.priceImpact?.isLessThan(ONE_BIPS)
                                ? '<0.01%'
                                : formatPercentage(cacheTrade.priceImpact)}
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography className={classes.title}>{t('plugin_trader_confirm_minimum_received')}</Typography>
                        <Typography className={classes.description}>
                            <FormattedBalance
                                value={cacheTrade.minimumReceived}
                                decimals={outputToken.decimals}
                                significant={6}
                                symbol={outputToken.symbol}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Box>

                    {!isZero(gasFee) ? (
                        <Box className={classes.section}>
                            <Typography className={classes.title}>{t('plugin_trader_gas')}</Typography>
                            <Typography className={classes.description}>
                                <Typography component="span" className={classes.edit} onClick={openSettingDialog}>
                                    {t('edit')}
                                </Typography>
                                <FormattedBalance
                                    value={gasFee}
                                    decimals={nativeToken.decimals ?? 0}
                                    significant={4}
                                    symbol={nativeToken.symbol}
                                    formatter={formatBalance}
                                />
                                <span>
                                    {gasFeeUSD === '<$0.01'
                                        ? t('plugin_trader_tx_cost_very_small', { usd: gasFeeUSD })
                                        : t('plugin_trader_confirm_tx_cost', { usd: gasFeeUSD })}
                                </span>
                            </Typography>
                        </Box>
                    ) : null}

                    {priceUpdated ? (
                        <Alert
                            classes={{ action: classes.action, message: classes.alertMessage, icon: classes.alertIcon }}
                            className={cx(classes.alert, classes.info)}
                            icon={<InfoIcon className={classes.infoIcon} />}
                            action={
                                <Button
                                    variant="roundedOutlined"
                                    size="small"
                                    color="info"
                                    fullWidth
                                    onClick={onAccept}>
                                    {t('plugin_trader_update')}
                                </Button>
                            }>
                            {t('plugin_trader_price_updated')}
                        </Alert>
                    ) : (
                        alertTip
                    )}
                </DialogContent>

                <DialogActions className={classes.actions}>
                    <PluginWalletStatusBar>
                        <Button disabled={staled || priceUpdated} fullWidth onClick={onConfirm}>
                            {t('plugin_trader_confirm_swap')}
                        </Button>
                    </PluginWalletStatusBar>
                </DialogActions>
            </InjectedDialog>
        )
    },
)
