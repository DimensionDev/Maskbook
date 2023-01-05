import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first, noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { useI18N } from '../../../../utils/index.js'
import {
    PluginWalletStatusBar,
    SelectTokenChip,
    TokenSecurityBar,
    useSelectAdvancedSettings,
    useTokenSecurity,
    WalletConnectedBoundary,
    EthereumERC20TokenApprovedBoundary,
    ChainBoundary,
} from '@masknet/shared'
import { makeStyles, MaskColorVar, ActionButton } from '@masknet/theme'
import { InputTokenPanel } from './InputTokenPanel.js'
import { alpha, Box, chipClasses, Collapse, IconButton, lighten, Typography } from '@mui/material'
import {
    ChainId,
    formatWeiToEther,
    GasConfig,
    GasEditor,
    SchemaType,
    Transaction,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import { isLessThan, rightShift, multipliedBy, leftShift } from '@masknet/web3-shared-base'
import { Tune as TuneIcon } from '@mui/icons-material'
import { TokenPanelType, TradeInfo } from '../../types/index.js'
import { Icons } from '@masknet/icons'
import { isNativeTokenWrapper } from '../../helpers/index.js'
import { DefaultTraderPlaceholder, TraderInfo } from './TraderInfo.js'
import { MINIMUM_AMOUNT, MIN_GAS_LIMIT } from '../../constants/index.js'
import { resolveTradeProviderName } from '../../pipes.js'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed.js'
import { isDashboardPage, isPopupPage, PopupRoutes, PluginID, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3State } from '@masknet/web3-hooks-base'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { TokenSecurityBoundary } from '@masknet/plugin-go-plus-security'
import { currentSlippageSettings } from '../../settings.js'
import { PluginTraderMessages } from '../../messages.js'
import Services from '../../../../extension/service.js'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useIsMinimalModeDashBoard } from '@masknet/plugin-infra/dashboard'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles<{
    isDashboard: boolean
    isPopup: boolean
}>()((theme, { isDashboard, isPopup }) => {
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
            color: isDashboard ? `${theme.palette.text.primary}!important` : theme.palette.maskColor?.main,
        },
        card: {
            background: isDashboard ? MaskColorVar.primaryBackground2 : theme.palette.maskColor?.input,
            border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
            borderRadius: 12,
            padding: 12,
        },
        reverse: {
            backgroundColor: isDashboard ? MaskColorVar.lightBackground : theme.palette.background.default,
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
            color: isDashboard ? theme.palette.text.primary : theme.palette.text.strong,
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
        button: {
            borderRadius: 8,
        },
        disabledButton: {
            borderRadius: 8,
        },
        selectedTokenChip: {
            borderRadius: '22px!important',
            height: 'auto',
            backgroundColor: isDashboard ? MaskColorVar.input : theme.palette.maskColor?.bottom,
            paddingRight: 8,
            [`& .${chipClasses.label}`]: {
                paddingTop: 10,
                paddingBottom: 10,
                lineHeight: '18px',
                fontSize: 14,
                marginRight: 12,
                fontWeight: 700,
                color: !isDashboard ? theme.palette.maskColor?.main : undefined,
            },
            ['&:hover']: {
                backgroundColor: `${isDashboard ? MaskColorVar.input : theme.palette.maskColor?.bottom}!important`,
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
            backgroundColor: isDashboard ? MaskColorVar.mainBackground : theme.palette.background.paper,
            position: 'sticky',
            bottom: isPopup ? -12 : -20,
        },
        noToken: {
            borderRadius: '18px !important',
            backgroundColor: `${
                isDashboard ? theme.palette.primary.main : theme.palette.maskColor?.primary
            } !important`,
            ['&:hover']: {
                backgroundColor: `${
                    isDashboard ? theme.palette.primary.main : lighten(theme.palette.maskColor?.primary, 0.1)
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
            color: `${isDashboard ? theme.palette.text.primary : theme.palette.maskColor.main}!important`,
        },
        whiteDrop: {
            color: '#ffffff !important',
        },
        stateBar: {
            position: 'sticky',
            bottom: 0,
            boxShadow: `0px 0px 20px ${alpha(
                theme.palette.maskColor.shadowBottom,
                theme.palette.mode === 'dark' ? 0.12 : 0.05,
            )}`,
        },
        unlockContainer: {
            margin: 0,
            width: '100%',
            ['& > div']: {
                padding: '0px !important',
            },
        },
        title: {
            fontSize: 14,
            fontWeight: 700,
            lineHeight: '18px',
            color: theme.palette.maskColor?.second,
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
    trades: TradeInfo[]
    focusedTrade?: TradeInfo
    gasPrice?: string
    onFocusedTradeChange: (trade: TradeInfo) => void
    onSwap: () => void
    onSwitch: () => void
    settings?: boolean
    gasConfig?: GasConfig
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
        onSwap,
        gasPrice,
        onSwitch,
        settings,
        gasConfig,
        ...props
    }) => {
        const maxAmountTrade = useRef<TradeInfo | null>(null)
        const userSelected = useRef(false)
        const isDashboard = isDashboardPage()
        const isPopup = isPopupPage()
        const { t } = useI18N()
        const { classes, cx } = useStyles({ isDashboard, isPopup }, { props })
        const { chainId } = useChainContext()
        const { pluginID } = useNetworkContext()
        const { Others } = useWeb3State()
        const { isSwapping, allTradeComputed } = AllProviderTradeContext.useContainer()
        const [isExpand, setExpand] = useState(false)
        const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
        const isSNSClosed = snsAdaptorMinimalPlugins?.map((x) => x.ID).includes(PluginID.GoPlusSecurity)
        const isDashboardClosed = useIsMinimalModeDashBoard(PluginID.GoPlusSecurity)
        const isTokenSecurityEnable = !isSNSClosed && !isDashboardClosed

        const { value: tokenSecurityInfo, error } = useTokenSecurity(
            pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
            outputToken?.address.trim(),
            isTokenSecurityEnable,
        )

        const isRisky = tokenSecurityInfo?.is_high_risk

        // #region approve token
        const { approveToken, approveAmount, approveAddress } = useTradeApproveComputed(
            focusedTrade?.value ?? null,
            focusedTrade?.provider,
            inputToken,
        )

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
            const gasFee = multipliedBy(marginGasPrice, focusedTrade?.gas.value ?? MIN_GAS_LIMIT)
            let amount_ = new BigNumber(inputTokenBalanceAmount.toFixed() ?? 0)
            amount_ = Others?.isNativeTokenSchemaType(inputToken?.schema) ? amount_.minus(gasFee) : amount_
            return leftShift(BigNumber.max(0, amount_), inputToken?.decimals)
        }, [focusedTrade, gasPrice, inputTokenTradeAmount, inputToken, Others?.isNativeTokenSchemaType])

        // #region UI logic
        // validate form return a message if an error exists
        const validationMessage = useMemo(() => {
            if (inputTokenTradeAmount.isZero()) return t('plugin_trader_error_amount_absence')
            if (isLessThan(inputAmount, MINIMUM_AMOUNT)) return t('plugin_trade_error_input_amount_less_minimum_amount')
            if (!inputToken || !outputToken) return t('plugin_trader_error_amount_absence')
            if (!trades.length) return t('plugin_trader_error_insufficient_lp')

            if (
                inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount) ||
                (Others?.isNativeTokenSchemaType(inputToken.schema) &&
                    formatWeiToEther(inputTokenTradeAmount).isGreaterThan(maxAmount))
            )
                return t('plugin_trader_error_insufficient_balance', {
                    symbol: inputToken?.symbol,
                })

            if (focusedTrade?.value && !focusedTrade.value.outputAmount) return t('plugin_trader_no_enough_liquidity')
            return ''
        }, [
            inputAmount,
            focusedTrade,
            trades,
            inputToken,
            outputToken,
            inputTokenBalanceAmount.toFixed(),
            inputTokenTradeAmount.toFixed(),
            maxAmount,
            Others?.isNativeTokenSchemaType,
        ])
        // #endregion

        // #region native wrap message
        const nativeWrapMessage = useMemo(() => {
            if (focusedTrade?.value) {
                if (isNativeTokenWrapper(focusedTrade.value)) {
                    return focusedTrade.value.trade_?.isWrap ? t('plugin_trader_wrap') : t('plugin_trader_unwrap')
                }
                return t('plugin_trader_swap_amount_symbol')
            } else {
                return t('plugin_trader_no_trade')
            }
        }, [focusedTrade, outputToken])
        // #endregion

        const handleAmountChange = useCallback(
            (amount: string) => {
                maxAmountTrade.current = maxAmount.isEqualTo(amount) && focusedTrade ? focusedTrade : null
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
                        isFocus={bestTrade.provider === focusedTrade?.provider}
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
                        isBest={bestTrade.provider === focusedTrade.provider}
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
            if (focusedTrade.provider !== maxAmountTrade.current.provider) maxAmountTrade.current = null
        }, [focusedTrade])

        useUpdateEffect(() => {
            maxAmountTrade.current = null
        }, [inputToken, outputToken])
        // #endregion

        // #region gas settings
        const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)
        const openSwapSettingDialog = useCallback(async () => {
            const { slippageTolerance, transaction } = await selectAdvancedSettings({
                chainId,
                disableGasLimit: true,
                disableSlippageTolerance: false,
                slippageTolerance: currentSlippageSettings.value / 100,
                transaction: {
                    gas: focusedTrade?.gas.value ?? MIN_GAS_LIMIT,
                    ...(gasConfig ?? {}),
                },
            })

            if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

            PluginTraderMessages.swapSettingsUpdated.sendToAll({
                open: false,
                gasConfig: GasEditor.fromTransaction(chainId as ChainId, transaction as Transaction).getGasConfig(),
            })
        }, [chainId, focusedTrade?.gas.value, selectAdvancedSettings, gasConfig])
        // #endregion

        // #region if `isPopup` be true, click the plugin status bar need to  open popup window
        const openSelectWalletPopup = useCallback(() => {
            Services.Helper.openPopupWindow(PopupRoutes.SelectWallet, {
                chainId,
            })
        }, [chainId])

        // #endregion
        return (
            <>
                <Box className={classes.root}>
                    <InputTokenPanel
                        chainId={chainId}
                        amount={inputAmount}
                        balance={inputTokenBalanceAmount.toFixed()}
                        token={inputToken}
                        onAmountChange={handleAmountChange}
                        maxAmount={maxAmount.toFixed()}
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
                                {isTokenSecurityEnable && tokenSecurityInfo && !error && (
                                    <TokenSecurityBar tokenSecurity={tokenSecurityInfo} />
                                )}
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
                                            key={trade.provider}
                                            trade={trade}
                                            onClick={() => {
                                                if (!userSelected.current) userSelected.current = true
                                                onFocusedTradeChange(trade)
                                                setExpand(false)
                                            }}
                                            isFocus={trade.provider === focusedTrade?.provider}
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
                <Box className={classes.stateBar}>
                    <PluginWalletStatusBar onClick={isPopup ? openSelectWalletPopup : undefined}>
                        {/* TODO: remove the chain boundary after sol network dex be added */}
                        {settings ? (
                            <ChainBoundary
                                expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                expectedChainId={chainId as ChainId}>
                                <WalletConnectedBoundary offChain>
                                    <EthereumERC20TokenApprovedBoundary
                                        onlyInfiniteUnlock
                                        spender={approveAddress}
                                        amount={approveAmount.toFixed()}
                                        classes={{ container: classes.unlockContainer }}
                                        contractName={
                                            focusedTrade?.provider
                                                ? resolveTradeProviderName(focusedTrade.provider)
                                                : ''
                                        }
                                        infiniteUnlockContent={t('plugin_trader_unlock_symbol', {
                                            symbol: approveToken?.symbol,
                                        })}
                                        expectedChainId={
                                            pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined
                                        }
                                        token={
                                            !isNativeTokenWrapper(focusedTrade?.value ?? null) &&
                                            approveToken?.schema === SchemaType.ERC20 &&
                                            !!approveAmount.toNumber()
                                                ? approveToken
                                                : undefined
                                        }
                                        ActionButtonProps={{
                                            color: 'primary',
                                            style: { borderRadius: 8 },
                                            size: 'medium',
                                        }}>
                                        <TokenSecurityBoundary
                                            tokenInfo={{
                                                name: tokenSecurityInfo?.token_name ?? '--',
                                                chainId: tokenSecurityInfo?.chainId ?? ChainId.Mainnet,
                                                contract: tokenSecurityInfo?.contract ?? ZERO_ADDRESS,
                                            }}
                                            disabled={
                                                focusedTrade?.loading ||
                                                !focusedTrade?.value ||
                                                !!validationMessage ||
                                                isSwapping
                                            }
                                            onSwap={onSwap}
                                            showTokenSecurity={isTokenSecurityEnable && isRisky}>
                                            <ActionButton
                                                fullWidth
                                                loading={isSwapping}
                                                variant="contained"
                                                disabled={
                                                    focusedTrade?.loading ||
                                                    !focusedTrade?.value ||
                                                    !!validationMessage ||
                                                    isSwapping
                                                }
                                                classes={{ root: classes.button, disabled: classes.disabledButton }}
                                                color="primary"
                                                onClick={onSwap}>
                                                {validationMessage || nativeWrapMessage}
                                            </ActionButton>
                                        </TokenSecurityBoundary>
                                    </EthereumERC20TokenApprovedBoundary>
                                </WalletConnectedBoundary>
                            </ChainBoundary>
                        ) : (
                            <WalletConnectedBoundary offChain>
                                <EthereumERC20TokenApprovedBoundary
                                    onlyInfiniteUnlock
                                    spender={approveAddress}
                                    amount={approveAmount.toFixed()}
                                    classes={{ container: classes.unlockContainer }}
                                    contractName={
                                        focusedTrade?.provider ? resolveTradeProviderName(focusedTrade.provider) : ''
                                    }
                                    infiniteUnlockContent={t('plugin_trader_unlock_symbol', {
                                        symbol: approveToken?.symbol,
                                    })}
                                    expectedChainId={
                                        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined
                                    }
                                    token={
                                        !isNativeTokenWrapper(focusedTrade?.value ?? null) &&
                                        approveToken?.schema === SchemaType.ERC20 &&
                                        !!approveAmount.toNumber()
                                            ? approveToken
                                            : undefined
                                    }
                                    ActionButtonProps={{
                                        color: 'primary',
                                        style: { borderRadius: 8 },
                                        size: 'medium',
                                    }}>
                                    <TokenSecurityBoundary
                                        tokenInfo={{
                                            name: tokenSecurityInfo?.token_name ?? '--',
                                            chainId: tokenSecurityInfo?.chainId ?? ChainId.Mainnet,
                                            contract: tokenSecurityInfo?.contract ?? ZERO_ADDRESS,
                                        }}
                                        disabled={
                                            focusedTrade?.loading ||
                                            !focusedTrade?.value ||
                                            !!validationMessage ||
                                            isSwapping
                                        }
                                        onSwap={onSwap}
                                        showTokenSecurity={isTokenSecurityEnable && isRisky}>
                                        <ActionButton
                                            fullWidth
                                            loading={isSwapping}
                                            variant="contained"
                                            disabled={
                                                focusedTrade?.loading ||
                                                !focusedTrade?.value ||
                                                !!validationMessage ||
                                                isSwapping
                                            }
                                            classes={{ root: classes.button, disabled: classes.disabledButton }}
                                            color="primary"
                                            onClick={onSwap}>
                                            {validationMessage || nativeWrapMessage}
                                        </ActionButton>
                                    </TokenSecurityBoundary>
                                </EthereumERC20TokenApprovedBoundary>
                            </WalletConnectedBoundary>
                        )}
                    </PluginWalletStatusBar>
                </Box>
            </>
        )
    },
)
