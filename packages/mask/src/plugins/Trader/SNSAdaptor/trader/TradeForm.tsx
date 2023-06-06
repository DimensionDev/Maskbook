import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first, noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { Tune as TuneIcon } from '@mui/icons-material'
import { Icons } from '@masknet/icons'
import { SelectTokenChip, TokenSecurityBar, useSelectAdvancedSettings, useTokenSecurity } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { alpha, Box, chipClasses, Collapse, IconButton, lighten, Typography } from '@mui/material'
import { type ChainId, type GasConfig, GasEditor, type Transaction } from '@masknet/web3-shared-evm'
import { rightShift, multipliedBy, isZero, ZERO, formatBalance } from '@masknet/web3-shared-base'
import { PluginID, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useIsMinimalModeDashBoard } from '@masknet/plugin-infra/dashboard'
import type { Web3Helper } from '@masknet/web3-helpers'
import { InputTokenPanel } from './InputTokenPanel.js'
import { useI18N } from '../../../../utils/index.js'
import { TokenPanelType } from '../../types/index.js'
import { DefaultTraderPlaceholder, TraderInfo } from './TraderInfo.js'
import { MIN_GAS_LIMIT } from '../../constants/index.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { currentSlippageSettings } from '../../settings.js'
import { PluginTraderMessages } from '../../messages.js'
import type { TraderAPI } from '@masknet/web3-providers/types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0px 16px 16px',
            marginTop: 28,
            flex: 1,
            maxHeight: 448,
            overflow: 'auto',
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        reverseIcon: {
            cursor: 'pointer',
            color: Sniffings.is_dashboard_page
                ? `${theme.palette.text.primary}!important`
                : theme.palette.maskColor.main,
        },
        card: {
            background: Sniffings.is_dashboard_page ? MaskColorVar.primaryBackground2 : theme.palette.maskColor.input,
            border: `1px solid ${Sniffings.is_dashboard_page ? MaskColorVar.lineLight : theme.palette.maskColor.line}`,
            borderRadius: 12,
            padding: 12,
        },
        reverse: {
            backgroundColor: Sniffings.is_dashboard_page
                ? MaskColorVar.lightBackground
                : theme.palette.background.default,
            width: 32,
            height: 32,
            borderRadius: 99,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        reverseWrapper: {
            backgroundColor: theme.palette.background.paper,
            padding: 2,
            borderRadius: 99,
            marginTop: -16,
            zIndex: 1,
        },
        chevron: {
            color: Sniffings.is_dashboard_page ? theme.palette.text.primary : theme.palette.text.strong,
            transition: 'all 300ms',
            cursor: 'pointer',
        },
        reverseChevron: {
            transform: 'rotate(-180deg)',
            transition: 'all 300ms',
        },
        status: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
        },
        label: {
            flex: 1,
            textAlign: 'left',
        },
        icon: {
            marginLeft: theme.spacing(0.5),
            width: 20,
            height: 20,
            fontSize: 20,
        },
        section: {
            width: '100%',
        },

        selectedTokenChip: {
            borderRadius: '22px!important',
            height: 'auto',
            backgroundColor: Sniffings.is_dashboard_page ? MaskColorVar.input : theme.palette.maskColor.bottom,
            paddingRight: 8,
            [`& .${chipClasses.label}`]: {
                paddingTop: 10,
                paddingBottom: 10,
                lineHeight: '18px',
                fontSize: 14,
                marginRight: 12,
                fontWeight: 700,
                color: !Sniffings.is_dashboard_page ? theme.palette.maskColor.main : undefined,
            },
            ['&:hover']: {
                backgroundColor: `${
                    Sniffings.is_dashboard_page ? MaskColorVar.input : theme.palette.maskColor.bottom
                }!important`,
                boxShadow: `0px 4px 30px ${alpha(
                    theme.palette.maskColor.shadowBottom,
                    theme.palette.mode === 'dark' ? 0.15 : 0.1,
                )}`,
            },
        },
        chipTokenIcon: {
            width: '28px!important',
            height: '28px!important',
        },
        controller: {
            width: '100%',
            // Just for design
            backgroundColor: Sniffings.is_dashboard_page ? MaskColorVar.mainBackground : theme.palette.maskColor.bottom,
            position: 'sticky',
            bottom: Sniffings.is_popup_page ? -12 : -20,
        },
        noToken: {
            borderRadius: '18px !important',
            backgroundColor: `${
                Sniffings.is_dashboard_page ? theme.palette.primary.main : theme.palette.maskColor.primary
            } !important`,
            ['&:hover']: {
                backgroundColor: `${
                    Sniffings.is_dashboard_page
                        ? theme.palette.primary.main
                        : lighten(theme.palette.maskColor.primary, 0.1)
                }!important`,
            },
            [`& .${chipClasses.label}`]: {
                color: `${theme.palette.common.white}!important`,
                marginRight: 4,
            },
        },
        dropIcon: {
            width: 20,
            height: 24,
            color: `${
                Sniffings.is_dashboard_page ? theme.palette.text.primary : theme.palette.maskColor.main
            }!important`,
        },
        whiteDrop: {
            color: '#ffffff !important',
        },

        title: {
            fontSize: 14,
            fontWeight: 700,
            lineHeight: '18px',
            color: theme.palette.maskColor.second,
            marginBottom: 12,
        },
    }
})

export interface AllTradeFormProps extends withClasses<'root'> {
    inputAmount: string
    inputToken?: Web3Helper.FungibleTokenAll
    outputToken?: Web3Helper.FungibleTokenAll
    inputTokenBalance?: string
    onInputAmountChange: (amount: string) => void
    onTokenChipClick?: (token: TokenPanelType) => void
    onRefreshClick?: () => void
    trades: Array<AsyncStateRetry<TraderAPI.TradeInfo>>
    focusedTrade?: AsyncStateRetry<TraderAPI.TradeInfo>
    gasPrice?: string
    onFocusedTradeChange: (trade: AsyncStateRetry<TraderAPI.TradeInfo>) => void
    onSwitch: () => void
    settings?: boolean
    gasConfig?: GasConfig
    isSmartPay: boolean
}

export const TradeForm = memo<AllTradeFormProps>(
    ({
        trades,
        inputAmount,
        inputToken,
        outputToken,
        onTokenChipClick = noop,
        onInputAmountChange,
        inputTokenBalance,
        focusedTrade,
        onFocusedTradeChange,
        isSmartPay,
        gasPrice,
        onSwitch,
        settings,
        gasConfig,
        ...props
    }) => {
        const maxAmountTrade = useRef<AsyncStateRetry<TraderAPI.TradeInfo> | null>(null)
        const userSelected = useRef(false)
        const { t } = useI18N()
        const { classes, cx } = useStyles(undefined, { props })
        const { chainId } = useChainContext()
        const { pluginID } = useNetworkContext()
        const Others = useWeb3Others()
        const { allTradeComputed } = AllProviderTradeContext.useContainer()
        const [isExpand, setExpand] = useState(false)

        const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
        const isSNSClosed = snsAdaptorMinimalPlugins.map((x) => x.ID).includes(PluginID.GoPlusSecurity)
        const isDashboardClosed = useIsMinimalModeDashBoard(PluginID.GoPlusSecurity)
        const isTokenSecurityEnable = !isSNSClosed && !isDashboardClosed

        // #region token balance
        const inputTokenBalanceAmount = new BigNumber(inputTokenBalance || '0')
        // #endregion

        // #region get the best trade
        const bestTrade = useMemo(() => first(trades), [trades])
        // #endregion

        // #region form controls
        const inputTokenTradeAmount = rightShift(inputAmount || '0', inputToken?.decimals)
        // #endregion

        const maxAmount = useMemo(() => {
            const marginGasPrice = multipliedBy(gasPrice ?? 0, 1.1)
            const gasFee = multipliedBy(marginGasPrice, focusedTrade?.value?.gas ?? MIN_GAS_LIMIT)
            let amount_ = new BigNumber(inputTokenBalanceAmount.toFixed() ?? 0)
            amount_ = BigNumber.max(
                0,
                Others.isNativeTokenSchemaType(inputToken?.schema) ? amount_.minus(gasFee) : amount_,
            )

            return isZero(amount_)
                ? ZERO.toString()
                : formatBalance(amount_.integerValue(), inputToken?.decimals, undefined, true)
        }, [focusedTrade, gasPrice, inputTokenTradeAmount, inputToken, Others.isNativeTokenSchemaType])

        const handleAmountChange = useCallback(
            (amount: string) => {
                maxAmountTrade.current =
                    new BigNumber(maxAmount).isEqualTo(amount) && focusedTrade ? focusedTrade : null
                onInputAmountChange(amount)
            },
            [onInputAmountChange, maxAmount, focusedTrade],
        )

        useUpdateEffect(() => {
            setExpand(false)
        }, [chainId, inputToken, inputAmount, outputToken])

        useUpdateEffect(() => {
            if (maxAmountTrade.current) {
                onFocusedTradeChange(maxAmountTrade.current)
                return
            }

            if (bestTrade?.value && !userSelected.current) {
                onFocusedTradeChange(bestTrade)
            }
        }, [bestTrade])

        const firstTraderInfo = useMemo(() => {
            if (!bestTrade) return null

            if (isExpand)
                return (
                    <TraderInfo
                        trade={bestTrade}
                        gasPrice={gasPrice}
                        onClick={() => {
                            if (!userSelected.current) userSelected.current = true
                            onFocusedTradeChange(bestTrade)
                            setExpand(false)
                        }}
                        isFocus={bestTrade.value?.provider === focusedTrade?.value?.provider}
                        isBest
                    />
                )
            else if (focusedTrade)
                return (
                    <TraderInfo
                        trade={focusedTrade}
                        gasPrice={gasPrice}
                        onClick={() => {
                            onFocusedTradeChange(focusedTrade)
                            setExpand(false)
                        }}
                        isFocus
                        isBest={bestTrade.value?.provider === focusedTrade.value?.provider}
                    />
                )
            return null
        }, [trades, bestTrade, gasPrice, focusedTrade, onFocusedTradeChange, isExpand])

        useUpdateEffect(() => {
            userSelected.current = false
        }, [inputAmount, inputToken, outputToken])

        // #region clear maxAmount trade cache
        useUpdateEffect(() => {
            if (!focusedTrade || !maxAmountTrade.current) return
            if (focusedTrade.value?.provider !== maxAmountTrade.current.value?.provider) maxAmountTrade.current = null
        }, [focusedTrade])

        useUpdateEffect(() => {
            maxAmountTrade.current = null
        }, [inputToken, outputToken])
        // #endregion

        // #region gas settings
        const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)
        const openSwapSettingDialog = useCallback(async () => {
            PluginTraderMessages.swapSettingsUpdated.sendToAll({
                open: true,
            })
            const { slippageTolerance, transaction } = await selectAdvancedSettings({
                chainId,
                disableGasLimit: true,
                disableSlippageTolerance: false,
                slippageTolerance: currentSlippageSettings.value / 100,
                transaction: {
                    gas: focusedTrade?.value?.gas ?? MIN_GAS_LIMIT,
                    ...gasConfig,
                },
            })

            if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

            PluginTraderMessages.swapSettingsUpdated.sendToAll({
                open: false,
                gasConfig: GasEditor.fromTransaction(chainId as ChainId, transaction as Transaction).getGasConfig(),
            })
        }, [chainId, focusedTrade?.value?.gas, selectAdvancedSettings, gasConfig])
        // #endregion

        const { value: tokenSecurityInfo, error } = useTokenSecurity(
            pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
            outputToken?.address.trim(),
            isTokenSecurityEnable,
        )

        return (
            <>
                <Box className={classes.root}>
                    <InputTokenPanel
                        isAvailableBalance={isSmartPay}
                        chainId={chainId}
                        amount={inputAmount}
                        balance={inputTokenBalanceAmount.toFixed()}
                        token={inputToken}
                        onAmountChange={handleAmountChange}
                        maxAmount={maxAmount}
                        SelectTokenChip={{
                            ChipProps: {
                                onClick: () => onTokenChipClick(TokenPanelType.Input),
                                onDelete: () => onTokenChipClick(TokenPanelType.Input),
                                deleteIcon: (
                                    <Icons.Drop
                                        className={cx(classes.dropIcon, !inputToken ? classes.whiteDrop : null)}
                                    />
                                ),
                            },
                        }}
                    />
                    <Box className={classes.reverseWrapper}>
                        <Box className={classes.reverse}>
                            <Icons.ArrowDownward className={classes.reverseIcon} onClick={onSwitch} />
                        </Box>
                    </Box>
                    <Box className={classes.section} marginBottom={2.5}>
                        <Box className={classes.card}>
                            <Typography className={classes.title}>{t('plugin_trader_swap_receive')}</Typography>
                            <SelectTokenChip
                                chainId={chainId}
                                classes={{
                                    chip: classes.selectedTokenChip,
                                    tokenIcon: classes.chipTokenIcon,
                                    noToken: classes.noToken,
                                }}
                                token={outputToken}
                                ChipProps={{
                                    onClick: () => onTokenChipClick(TokenPanelType.Output),
                                    onDelete: () => onTokenChipClick(TokenPanelType.Output),
                                    deleteIcon: (
                                        <Icons.Drop
                                            className={cx(classes.dropIcon, !outputToken ? classes.whiteDrop : null)}
                                        />
                                    ),
                                }}
                            />
                            <Box marginTop="8px">
                                {isTokenSecurityEnable && tokenSecurityInfo && !error ? (
                                    <TokenSecurityBar tokenSecurity={tokenSecurityInfo} />
                                ) : null}
                            </Box>

                            <Box marginTop="12px">
                                {trades.filter((item) => !!item.value).length > 0 ? (
                                    firstTraderInfo
                                ) : (
                                    <DefaultTraderPlaceholder />
                                )}
                                <Collapse in={isExpand}>
                                    {trades.slice(1).map((trade) => (
                                        <TraderInfo
                                            key={trade.value?.provider}
                                            trade={trade}
                                            onClick={() => {
                                                if (!userSelected.current) userSelected.current = true
                                                onFocusedTradeChange(trade)
                                                setExpand(false)
                                            }}
                                            isFocus={trade.value?.provider === focusedTrade?.value?.provider}
                                            gasPrice={gasPrice}
                                        />
                                    ))}
                                </Collapse>
                                {trades.filter((x) => !!x.value).length > 1 ? (
                                    <Box width="100%" display="flex" justifyContent="center" marginTop={1.5}>
                                        <Icons.ChevronUp
                                            className={cx(classes.chevron, isExpand ? classes.reverseChevron : null)}
                                            onClick={() => setExpand(!isExpand)}
                                        />
                                    </Box>
                                ) : null}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                {settings ? (
                    <Box className={classes.section}>
                        <Box className={classes.controller}>
                            <Box className={classes.section}>
                                <div className={classes.status}>
                                    <Typography className={classes.label} color="textSecondary" variant="body2">
                                        {t('plugin_trader_slippage_tolerance')}
                                    </Typography>
                                    <IconButton
                                        className={classes.icon}
                                        size="small"
                                        onClick={() => allTradeComputed.forEach((x) => x.retry())}>
                                        <Icons.Refresh />
                                    </IconButton>
                                    <IconButton className={classes.icon} size="small" onClick={openSwapSettingDialog}>
                                        <TuneIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            </Box>
                        </Box>
                    </Box>
                ) : null}
            </>
        )
    },
)
