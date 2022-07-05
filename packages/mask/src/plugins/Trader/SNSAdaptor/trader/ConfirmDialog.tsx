import { CramIcon, InfoIcon, RetweetIcon } from '@masknet/icons'
import { FormattedAddress, FormattedBalance, InjectedDialog, TokenIcon } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import type { TradeComputed } from '../../types'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import {
    createNativeToken,
    formatEthereumAddress,
    formatPercentage,
    formatUSD,
    formatWeiToEther,
    explorerResolver,
} from '@masknet/web3-shared-evm'
import { Alert, Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'react-feather'
import { useUpdateEffect } from 'react-use'
import { PluginWalletStatusBar, useI18N } from '../../../../utils'
import { FungibleToken, isZero, multipliedBy, NetworkPluginID, formatBalance, Wallet } from '@masknet/web3-shared-base'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { currentSlippageSettings } from '../../settings'
import { useNativeTokenPrice } from '@masknet/plugin-infra/web3'
import { ONE_BIPS } from '../../constants'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    section: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '& > p': {
            fontSize: 16,
            lineHeight: '22px',
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            margin: '12px 0',
        },
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginRight: 4,
    },
    alert: {
        backgroundColor: MaskColorVar.twitterInfoBackground.alpha(0.1),
        color: MaskColorVar.twitterInfo,
        marginTop: 12,
        fontSize: 12,
        lineHeight: '16px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        backgroundColor: MaskColorVar.redMain.alpha(0.1),
        color: isDashboard ? MaskColorVar.redMain : theme.palette.error.main,
        marginTop: 12,
        fontSize: 12,
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        padding: 16,
    },
    action: {
        marginRight: 0,
    },
    alertIcon: {
        color: MaskColorVar.twitterInfo,
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
        backgroundColor: isDashboard ? MaskColorVar.redMain : theme.palette.error.main,
        fontWeight: 600,
        fontSize: 14,
        lineHeight: '20px',
        padding: '10px 16px',
        borderRadius: 20,
    },
    warning: {
        color: `${isDashboard ? MaskColorVar.redMain : theme.palette.error.main}!important`,
    },
}))

const PERCENT_DENOMINATOR = 10000

const MIN_SLIPPAGE = 150
const MAX_SLIPPAGE = 1000

export interface ConfirmDialogUIProps extends withClasses<never> {
    open: boolean
    trade: TradeComputed
    inputToken: FungibleToken<ChainId, SchemaType>
    outputToken: FungibleToken<ChainId, SchemaType>
    gas?: number
    gasPrice?: string
    onConfirm: () => void
    onClose?: () => void
    wallet?: Wallet | null
    account?: string
}

export function ConfirmDialogUI(props: ConfirmDialogUIProps) {
    const { t } = useI18N()
    const { open, trade, wallet, inputToken, outputToken, onConfirm, onClose, gas, gasPrice, account } = props

    const [cacheTrade, setCacheTrade] = useState<TradeComputed | undefined>()
    const [priceUpdated, setPriceUpdated] = useState(false)
    const currentSlippage = useValueRef(currentSlippageSettings)
    const isDashboard = isDashboardPage()
    const classes = useStylesExtends(useStyles({ isDashboard }), props)

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

    const gasFee = useMemo(() => {
        return gas && gasPrice ? multipliedBy(gasPrice, gas).integerValue().toFixed() : '0'
    }, [gas, gasPrice])

    const feeValueUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(tokenPrice))
    }, [gasFee, tokenPrice])
    // #endregion

    const staled = !!(executionPrice && !executionPrice.isEqualTo(cacheTrade?.executionPrice ?? 0))

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(cacheTrade?.priceImpact)

    const alertTip = useMemo(() => {
        if (currentSlippage >= MIN_SLIPPAGE && currentSlippage < MAX_SLIPPAGE) return null

        return (
            <Alert className={classes.alert} icon={<InfoIcon className={classes.alertIcon} />} severity="info">
                {currentSlippage < MIN_SLIPPAGE
                    ? t('plugin_trader_confirm_tips')
                    : t('plugin_trader_price_impact_warning_tips')}
            </Alert>
        )
    }, [currentSlippage])

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
            <InjectedDialog open={open} onClose={onClose} title="Confirm Swap">
                <DialogContent className={classes.content}>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_red_packet_nft_account_name')}</Typography>
                        <Typography>
                            {wallet?.name ? (
                                `(${wallet.name})`
                            ) : (
                                <FormattedAddress address={account} size={10} formatter={formatEthereumAddress} />
                            )}
                            <FormattedAddress
                                address={wallet?.address ?? ''}
                                size={4}
                                formatter={formatEthereumAddress}
                            />
                            {wallet?.address ? (
                                <Link
                                    style={{ color: 'inherit', height: 20 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={explorerResolver.addressLink(chainId, wallet.address)}>
                                    <ExternalLink style={{ marginLeft: 5 }} size={20} />
                                </Link>
                            ) : null}
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_from')}</Typography>
                        <Typography component="div" display="flex">
                            <TokenIcon
                                classes={{ icon: classes.tokenIcon }}
                                address={inputToken.address}
                                logoURL={inputToken.logoURL}
                            />
                            <FormattedBalance
                                value={inputAmount.toFixed() ?? '0'}
                                decimals={inputToken.decimals}
                                symbol={inputToken.symbol}
                                significant={4}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_to')}</Typography>
                        <Typography component="div" display="flex">
                            <TokenIcon
                                classes={{ icon: classes.tokenIcon }}
                                address={outputToken.address}
                                logoURL={outputToken.logoURL}
                            />
                            <FormattedBalance
                                value={outputAmount.toFixed() ?? '0'}
                                decimals={outputToken.decimals}
                                symbol={outputToken.symbol}
                                significant={4}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_tab_price')}</Typography>
                        <Typography>
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
                        <Typography>{t('plugin_trader_price_impact')}</Typography>
                        <Typography
                            className={isGreatThanSlippageSetting || temporarySlippage ? classes.warning : undefined}>
                            {cacheTrade?.priceImpact?.isLessThan(ONE_BIPS)
                                ? '<0.01%'
                                : formatPercentage(cacheTrade.priceImpact)}
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_max_price_slippage')}</Typography>
                        <Typography className={temporarySlippage ? classes.warning : undefined}>
                            {(temporarySlippage ?? currentSlippage) / 100}%
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_minimum_received')}</Typography>
                        <Typography className={temporarySlippage ? classes.warning : undefined}>
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
                            <Typography>{t('plugin_trader_gas')}</Typography>
                            <Typography>
                                <FormattedBalance
                                    value={gasFee}
                                    decimals={nativeToken.decimals ?? 0}
                                    significant={4}
                                    symbol={nativeToken.symbol}
                                    formatter={formatBalance}
                                />
                                <Typography component="span">
                                    {feeValueUSD === '<$0.01'
                                        ? t('plugin_trader_tx_cost_very_small', { usd: feeValueUSD })
                                        : t('plugin_trader_tx_cost_usd', { usd: feeValueUSD })}
                                </Typography>
                            </Typography>
                        </Box>
                    ) : null}
                    {priceUpdated ? (
                        <Alert
                            classes={{ action: classes.action }}
                            className={classes.error}
                            severity="error"
                            icon={<CramIcon className={classes.alertIcon} />}
                            action={
                                <Button color="error" className={classes.accept} onClick={onAccept}>
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
