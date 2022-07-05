import { memo, useMemo, useRef, useState } from 'react'
import { PluginWalletStatusBar, useI18N } from '../../../../utils'
import { makeStyles, MaskColorVar, parseColor } from '@masknet/theme'
import { InputTokenPanel } from './InputTokenPanel'
import { Box, chipClasses, Collapse, IconButton, Typography } from '@mui/material'
import { ChainId, formatPercentage, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleToken, isLessThan, formatBalance, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { TokenPanelType, TradeInfo } from '../../types'
import BigNumber from 'bignumber.js'
import { first, noop } from 'lodash-unified'
import { FormattedBalance, SelectTokenChip, useSelectAdvancedSettings } from '@masknet/shared'
import { ChevronUpIcon, DropIcon } from '@masknet/icons'
import classnames from 'classnames'
import { TraderInfo } from './TraderInfo'
import { isNativeTokenWrapper, toBips } from '../../helpers'
import { currentSlippageSettings } from '../../settings'
import TuneIcon from '@mui/icons-material/Tune'
import { MINIMUM_AMOUNT } from '../../constants'
import { resolveTradeProviderName } from '../../pipes'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { ArrowDownward } from '@mui/icons-material'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { useUpdateEffect } from 'react-use'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
import { PluginTraderMessages } from '../../messages'

const useStyles = makeStyles<{ isDashboard: boolean; isPopup: boolean }>()((theme, { isDashboard, isPopup }) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 16,
        },
        reverseIcon: {
            cursor: 'pointer',
            color: isDashboard ? `${theme.palette.text.primary}!important` : theme.palette.text.strong,
        },
        card: {
            backgroundColor: isDashboard ? MaskColorVar.primaryBackground2 : theme.palette.background.default,
            border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.divider}`,
            borderRadius: 12,
            padding: 12,
        },
        balance: {
            fontSize: 14,
            lineHeight: '20px',
            color: theme.palette.text.primary,
        },
        amount: {
            marginLeft: 10,
        },

        reverse: {
            backgroundColor: isDashboard ? MaskColorVar.lightBackground : theme.palette.background.default,
            width: 32,
            height: 32,
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0 16px 0',
        },
        chevron: {
            fill: 'none',
            stroke: isDashboard ? theme.palette.text.primary : theme.palette.text.strong,
            transition: 'all 300ms',
            cursor: 'pointer',
            color: theme.palette.text.primary,
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
        },
        section: {
            width: '100%',
        },
        chainBoundary: {
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
            backgroundColor: isDashboard ? MaskColorVar.input : theme.palette.background.input,
            [`& .${chipClasses.label}`]: {
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: 13,
                lineHeight: '18px',
                marginRight: 8,
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
            backgroundColor: theme.palette.primary.main,
            [`& .${chipClasses.label}`]: {
                paddingTop: 9,
                paddingBottom: 9,
                fontSize: 10,
                lineHeight: '18px',
                color: theme.palette.primary.contrastText,
                marginRight: 0,
            },
        },
        dropIcon: {
            width: 20,
            height: 24,
            fill: isDashboard ? theme.palette.text.primary : theme.palette.text.strong,
        },
        connectWallet: {
            marginTop: 0,
        },
        slippageValue: {
            fontSize: 12,
            lineHeight: '16px',
            color: theme.palette.text.secondary,
        },
        stateBar: {
            backgroundColor: parseColor(theme.palette.maskColor?.bottom).setAlpha(0.8).toRgbString(),
            position: 'sticky',
            bottom: 0,
            backdropFilter: 'blur(16px)',
        },
        unlockContainer: {
            margin: 0,
            width: '100%',
            ['& > div']: {
                padding: '0px !important',
            },
        },
    }
})

export interface AllTradeFormProps {
    account?: string | null
    inputAmount: string
    inputToken?: FungibleToken<ChainId, SchemaType>
    outputToken?: FungibleToken<ChainId, SchemaType>
    inputTokenBalance?: string
    outputTokenBalance?: string
    onInputAmountChange: (amount: string) => void
    onTokenChipClick?: (token: TokenPanelType) => void
    onRefreshClick?: () => void
    trades: TradeInfo[]
    focusedTrade?: TradeInfo
    gasPrice?: string
    onFocusedTradeChange: (trade: TradeInfo) => void
    onSwap: () => void
    onSwitch: () => void
}

export const TradeForm = memo<AllTradeFormProps>(
    ({
        account,
        trades,
        inputAmount,
        inputToken,
        outputToken,
        onTokenChipClick = noop,
        onInputAmountChange,
        inputTokenBalance,
        outputTokenBalance,
        focusedTrade,
        onFocusedTradeChange,
        onSwap,
        gasPrice,
        onSwitch,
    }) => {
        const userSelected = useRef(false)
        const isDashboard = isDashboardPage()
        const isPopup = isPopupPage()
        const { t } = useI18N()
        const { classes } = useStyles({ isDashboard, isPopup })
        const { targetChainId: chainId } = TargetChainIdContext.useContainer()
        const { isSwapping } = AllProviderTradeContext.useContainer()
        const [isExpand, setExpand] = useState(false)

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

        const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)

        // #region form controls
        const inputTokenTradeAmount = rightShift(inputAmount || '0', inputToken?.decimals)
        // #endregion

        // #region UI logic
        // validate form return a message if an error exists
        const validationMessage = useMemo(() => {
            if (inputTokenTradeAmount.isZero()) return t('plugin_trader_error_amount_absence')
            if (isLessThan(inputAmount, MINIMUM_AMOUNT)) return t('plugin_trade_error_input_amount_less_minimum_amount')
            if (!inputToken || !outputToken) return t('plugin_trader_error_amount_absence')
            if (!trades.length) return t('plugin_trader_error_insufficient_lp')
            if (inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount))
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
        ])
        // #endregion

        // #region native wrap message
        const nativeWrapMessage = useMemo(() => {
            if (focusedTrade?.value) {
                if (isNativeTokenWrapper(focusedTrade.value)) {
                    return focusedTrade.value.trade_?.isWrap ? t('plugin_trader_wrap') : t('plugin_trader_unwrap')
                }
                return t('plugin_trader_swap_amount_symbol', {
                    amount: formatBalance(
                        focusedTrade?.value?.outputAmount ?? 0,
                        focusedTrade?.value?.outputToken?.decimals,
                        2,
                    ),
                    symbol: outputToken?.symbol,
                })
            } else {
                return t('plugin_trader_no_trade')
            }
        }, [focusedTrade, outputToken])
        // #endregion

        useUpdateEffect(() => {
            setExpand(false)
        }, [chainId, inputToken, inputAmount, outputToken])

        useUpdateEffect(() => {
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

        const isGreatThanSlippageSetting = useGreatThanSlippageSetting(focusedTrade?.value?.priceImpact)

        return (
            <>
                <Box className={classes.root}>
                    <Box display="flex" justifyContent="flex-start" mb={1} width="100%">
                        <Typography fontSize={14} lineHeight="20px">
                            {t('plugin_trader_swap_from')}
                        </Typography>
                    </Box>
                    <InputTokenPanel
                        chainId={chainId}
                        amount={inputAmount}
                        balance={inputTokenBalanceAmount.toFixed()}
                        token={inputToken}
                        onAmountChange={onInputAmountChange}
                        SelectTokenChip={{
                            ChipProps: {
                                onClick: () => onTokenChipClick(TokenPanelType.Input),
                                deleteIcon: (
                                    <DropIcon
                                        className={classes.dropIcon}
                                        style={{ fill: !inputToken ? '#ffffff' : undefined }}
                                    />
                                ),
                                onDelete: noop,
                            },
                        }}
                    />
                    <Box className={classes.reverse}>
                        <ArrowDownward className={classes.reverseIcon} color="primary" onClick={onSwitch} />
                    </Box>
                    <Box className={classes.section} marginBottom={2.5}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            {outputToken && outputTokenBalance !== undefined ? (
                                <>
                                    <Typography fontSize={14} lineHeight="20px">
                                        {t('plugin_trader_swap_to')}
                                    </Typography>
                                    <Typography className={classes.balance}>
                                        {t('plugin_ito_list_table_got')}:
                                        <Typography component="span" className={classes.amount} color="primary">
                                            <FormattedBalance
                                                value={outputTokenBalance}
                                                decimals={outputToken?.decimals}
                                                significant={6}
                                                formatter={formatBalance}
                                            />
                                        </Typography>
                                    </Typography>
                                </>
                            ) : null}
                        </Box>

                        <Box className={classes.card}>
                            <SelectTokenChip
                                classes={{
                                    chip: classes.selectedTokenChip,
                                    tokenIcon: classes.chipTokenIcon,
                                    noToken: classes.noToken,
                                }}
                                token={outputToken}
                                ChipProps={{
                                    onClick: () => onTokenChipClick(TokenPanelType.Output),
                                    deleteIcon: (
                                        <DropIcon
                                            className={classes.dropIcon}
                                            style={{ fill: !outputToken ? '#ffffff' : undefined }}
                                        />
                                    ),
                                    onDelete: noop,
                                }}
                            />

                            {trades.filter((item) => !!item.value).length >= 1 ? (
                                <>
                                    <Box marginTop="20px">
                                        {firstTraderInfo}
                                        <Collapse in={isExpand}>
                                            {trades.slice(1).map((trade) => (
                                                <TraderInfo
                                                    key={trade.provider}
                                                    trade={trade}
                                                    onClick={() => {
                                                        if (!userSelected.current) userSelected.current = true
                                                        onFocusedTradeChange(trade)
                                                    }}
                                                    isFocus={trade.provider === focusedTrade?.provider}
                                                    gasPrice={gasPrice}
                                                />
                                            ))}
                                        </Collapse>
                                    </Box>
                                    <Box width="100%" display="flex" justifyContent="center" marginTop={1.5}>
                                        <ChevronUpIcon
                                            className={classnames(
                                                classes.chevron,
                                                isExpand ? classes.reverseChevron : null,
                                            )}
                                            onClick={() => setExpand(!isExpand)}
                                        />
                                    </Box>
                                </>
                            ) : null}
                        </Box>
                    </Box>
                </Box>

                <Box className={classes.section}>
                    <Box className={classes.controller}>
                        <Box className={classes.section}>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_trader_slippage_tolerance')}{' '}
                                </Typography>
                                <Typography className={classes.slippageValue}>
                                    {formatPercentage(toBips(currentSlippageSettings.value))}
                                </Typography>
                                <IconButton
                                    className={classes.icon}
                                    size="small"
                                    onClick={async () => {
                                        const { slippageTolerance, transaction } = await selectAdvancedSettings()

                                        if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

                                        PluginTraderMessages.swapSettingsUpdated.sendToAll({
                                            open: false,
                                            gasConfig: {
                                                gasPrice: transaction?.gasPrice as string | undefined,
                                                maxFeePerGas: transaction?.maxFeePerGas as string | undefined,
                                                maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas as
                                                    | string
                                                    | undefined,
                                            },
                                        })
                                    }}>
                                    <TuneIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </Box>
                    </Box>
                </Box>

                <PluginWalletStatusBar className={classes.stateBar}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId}
                        noSwitchNetworkTip
                        className={classes.chainBoundary}
                        ActionButtonPromiseProps={{
                            fullWidth: true,
                            classes: { root: classes.button, disabled: classes.disabledButton },
                            color: 'primary',
                        }}>
                        <WalletConnectedBoundary>
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
                                {isGreatThanSlippageSetting ? (
                                    <ActionButton
                                        fullWidth
                                        loading={isSwapping}
                                        variant="contained"
                                        color="error"
                                        disabled={focusedTrade?.loading || !focusedTrade?.value || isSwapping}
                                        classes={{ root: classes.button, disabled: classes.disabledButton }}
                                        onClick={onSwap}>
                                        {t('plugin_trader_confirm_price_impact', {
                                            percent: formatPercentage(focusedTrade?.value?.priceImpact ?? 0),
                                        })}
                                    </ActionButton>
                                ) : (
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
                                )}
                            </EthereumERC20TokenApprovedBoundary>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </>
        )
    },
)
