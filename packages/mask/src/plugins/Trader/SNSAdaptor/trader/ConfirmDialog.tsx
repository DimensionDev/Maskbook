import { InfoIcon, RetweetIcon, WarningTriangleIcon } from '@masknet/icons'
import { FormattedBalance, FormattedCurrency, InjectedDialog, TokenIcon } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import type { TradeComputed } from '../../types'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar, parseColor } from '@masknet/theme'
import { createNativeToken, formatPercentage, formatUSD, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Alert, Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import {
    FungibleToken,
    isZero,
    multipliedBy,
    NetworkPluginID,
    formatBalance,
    Wallet,
    formatCurrency,
} from '@masknet/web3-shared-base'
import { PluginWalletStatusBar, useI18N } from '../../../../utils'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { currentSlippageSettings } from '../../settings'
import { useNativeTokenPrice, useFungibleTokenPrice } from '@masknet/plugin-infra/web3'
import { ONE_BIPS } from '../../constants'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'
import { ArrowDownward } from '@mui/icons-material'
import { PluginTraderMessages } from '../../messages'

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
        borderRadius: 16,
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
        color: isDashboard ? theme.palette.error.main : theme.palette.maskColor?.danger,
    },
    action: {
        marginRight: 0,
    },
    infoIcon: {
        color: isDashboard ? MaskColorVar.twitterInfo : theme.palette.maskColor?.main,
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius: isDashboard ? 8 : 24,
        height: 'auto',
    },
    content: {
        marginLeft: 40,
        marginRight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        padding: 0,
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
}))

const PERCENT_DENOMINATOR = 10000

const MIN_SLIPPAGE = 50 // 0.5%
const MAX_SLIPPAGE = 500 // 5%

export interface ConfirmDialogUIProps {
    open: boolean
    trade: TradeComputed
    inputToken: FungibleToken<ChainId, SchemaType>
    outputToken: FungibleToken<ChainId, SchemaType>
    gas?: number
    gasPrice?: string
    onConfirm: () => void
    onClose?: () => void
    openPriceImpact?: () => void
    wallet?: Wallet | null
    account?: string
}

export function ConfirmDialogUI(props: ConfirmDialogUIProps) {
    const { t } = useI18N()
    const { open, trade, inputToken, outputToken, onConfirm, onClose, gas, gasPrice, openPriceImpact } = props

    const [cacheTrade, setCacheTrade] = useState<TradeComputed | undefined>()
    const [priceUpdated, setPriceUpdated] = useState(false)
    const currentSlippage = useValueRef(currentSlippageSettings)
    const isDashboard = isDashboardPage()
    const { classes, cx } = useStyles({ isDashboard })

    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { setTemporarySlippage, temporarySlippage } = AllProviderTradeContext.useContainer()
    const [priceReversed, setPriceReversed] = useState(false)

    // #region detect price changing
    const [executionPrice, setExecutionPrice] = useState<BigNumber | undefined>(cacheTrade?.executionPrice)
    useEffect(() => {
        if (open) setExecutionPrice(undefined)
    }, [open])
    // #endregion

    // #region gas price
    const nativeToken = createNativeToken(chainId)
    const { value: tokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { value: inputTokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, inputToken.address)
    const { value: outputTokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, outputToken.address)

    const gasFee = useMemo(() => {
        return gas && gasPrice ? multipliedBy(gasPrice, gas).integerValue().toFixed() : '0'
    }, [gas, gasPrice])

    const feeValueUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(tokenPrice))
    }, [gasFee, tokenPrice])
    // #endregion

    // #region remote controlled swap settings dialog
    const { openDialog: openSwapSettingDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    // #endregion

    const staled = !!(executionPrice && !executionPrice.isEqualTo(cacheTrade?.executionPrice ?? 0))

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(cacheTrade?.priceImpact)

    const alertTip = useMemo(() => {
        if (currentSlippage < MIN_SLIPPAGE && !isGreatThanSlippageSetting)
            return (
                <Alert
                    classes={{ message: classes.alertMessage }}
                    className={cx(classes.alert, classes.warning)}
                    icon={<WarningTriangleIcon />}
                    severity="warning">
                    {t('plugin_trader_confirm_tips')}
                </Alert>
            )
        else if (currentSlippage > MAX_SLIPPAGE && !isGreatThanSlippageSetting) {
            return (
                <Alert
                    classes={{ message: classes.alertMessage }}
                    className={cx(classes.alert, classes.warning)}
                    icon={<WarningTriangleIcon />}
                    severity="warning">
                    {t('plugin_trader_confirm_tips')}
                </Alert>
            )
        } else if (isGreatThanSlippageSetting && cacheTrade?.priceImpact) {
            return (
                <Alert
                    classes={{ message: classes.alertMessage }}
                    className={cx(classes.alert, classes.error)}
                    icon={<InfoIcon className={classes.danger} />}
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

    const onConfirmPriceImpact = useCallback(() => {
        if (!cacheTrade?.priceImpact) return
        setTemporarySlippage(
            new BigNumber(cacheTrade?.priceImpact.multipliedBy(PERCENT_DENOMINATOR).toFixed(0)).toNumber(),
        )
    }, [cacheTrade?.priceImpact])

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
    }, [open, trade, cacheTrade])
    // #endregion

    if (!cacheTrade) return null

    const { inputAmount, outputAmount } = cacheTrade

    return (
        <>
            <InjectedDialog open={open} onClose={onClose} title={t('plugin_trader_confirm_swap')}>
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
                            <Typography className={classes.symbol}>
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
                            <Typography className={classes.symbol}>
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
                        <Typography className={temporarySlippage ? classes.danger : classes.description}>
                            <Typography component="span" className={classes.edit} onClick={openSwapSettingDialog}>
                                {t('edit')}
                            </Typography>
                            {(temporarySlippage ?? currentSlippage) / 100}%
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography className={classes.title}>{t('plugin_trader_price_impact')}</Typography>
                        <Typography
                            className={
                                isGreatThanSlippageSetting || temporarySlippage ? classes.danger : classes.description
                            }>
                            {cacheTrade?.priceImpact?.isLessThan(ONE_BIPS)
                                ? '<0.01%'
                                : formatPercentage(cacheTrade.priceImpact)}
                        </Typography>
                    </Box>

                    <Box className={classes.section}>
                        <Typography className={classes.title}>{t('plugin_trader_confirm_minimum_received')}</Typography>
                        <Typography className={temporarySlippage ? classes.danger : classes.description}>
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
                                <Typography component="span" className={classes.edit} onClick={openSwapSettingDialog}>
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
                                    {feeValueUSD === '<$0.01'
                                        ? t('plugin_trader_tx_cost_very_small', { usd: feeValueUSD })
                                        : t('plugin_trader_confirm_tx_cost', { usd: feeValueUSD })}
                                </span>
                            </Typography>
                        </Box>
                    ) : null}

                    {priceUpdated ? (
                        <Alert
                            classes={{ action: classes.action, message: classes.alertMessage }}
                            className={cx(classes.alert, classes.info)}
                            icon={<InfoIcon className={classes.infoIcon} />}
                            action={
                                <Button variant="roundedOutlined" size="small" color="error" onClick={onAccept}>
                                    {t('plugin_trader_accept')}
                                </Button>
                            }>
                            {t('plugin_trader_price_updated')}
                        </Alert>
                    ) : (
                        alertTip
                    )}
                </DialogContent>
                {!priceUpdated ? (
                    <DialogActions className={classes.actions}>
                        <PluginWalletStatusBar>
                            {isGreatThanSlippageSetting ? (
                                <Button
                                    classes={{ root: classes.button }}
                                    color="error"
                                    size="large"
                                    fullWidth
                                    disabled={staled}
                                    onClick={onConfirmPriceImpact}>
                                    {t('plugin_trader_confirm_price_impact', {
                                        percent: formatPercentage(cacheTrade.priceImpact),
                                    })}
                                </Button>
                            ) : (
                                <Button
                                    classes={{ root: classes.button }}
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    disabled={staled}
                                    onClick={onConfirm}>
                                    {t('plugin_trader_confirm_swap')}
                                </Button>
                            )}
                        </PluginWalletStatusBar>
                    </DialogActions>
                ) : null}
            </InjectedDialog>
        </>
    )
}

export interface ConfirmDialogProps extends ConfirmDialogUIProps {}

export function ConfirmDialog(props: ConfirmDialogProps) {
    return <ConfirmDialogUI {...props} />
}
