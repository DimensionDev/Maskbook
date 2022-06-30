import { memo, useMemo, useRef, useState } from 'react'
import { PluginWalletStatusBar, useI18N } from '../../../../utils'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { InputTokenPanel } from './InputTokenPanel'
import { Box, chipClasses, Collapse, Typography } from '@mui/material'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleToken, isLessThan, formatBalance, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { TokenPanelType, TradeInfo } from '../../types'
import BigNumber from 'bignumber.js'
import { first, noop } from 'lodash-unified'
import { SelectTokenChip } from '@masknet/shared'
import { ChevronUpIcon, DropIcon } from '@masknet/icons'
import classnames from 'classnames'
import { TraderInfo } from './TraderInfo'
import { isNativeTokenWrapper } from '../../helpers'
import { MINIMUM_AMOUNT } from '../../constants'
import { resolveTradeProviderName } from '../../pipes'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { ArrowDownward } from '@mui/icons-material'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { useUpdateEffect } from 'react-use'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'

const useStyles = makeStyles<{ isDashboard: boolean; isPopup: boolean }>()((theme, { isDashboard, isPopup }) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '28px 16px 16px',
            flex: 1,
        },
        reverseIcon: {
            cursor: 'pointer',
            stroke: isDashboard ? `${theme.palette.text.primary}!important` : theme.palette.maskColor?.main,
        },
        card: {
            background: isDashboard ? MaskColorVar.primaryBackground2 : theme.palette.maskColor?.input,
            border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
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
        },
        reverseWrapper: {
            backgroundColor: theme.palette.background.paper,
            padding: 2,
            borderRadius: 99,
            marginTop: -16,
            zIndex: 1,
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
                // TODO: replace to theme pop-shadow prop
                boxShadow:
                    theme.palette.mode === 'dark'
                        ? '0px 4px 30px rgba(255, 255, 255, 0.15)'
                        : '0px 4px 30px rgba(0, 0, 0, 0.1)',
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
                    isDashboard ? theme.palette.primary.main : theme.palette.maskColor?.primary
                }!important`,
            },
            [`& .${chipClasses.label}`]: {
                color: theme.palette.common.white,
                marginRight: 4,
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
            position: 'sticky',
            bottom: 0,
            boxShadow:
                theme.palette.mode === 'dark'
                    ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                    : '0px 0px 20px rgba(0, 0, 0, 0.05)',
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

        return (
            <>
                <Box className={classes.root}>
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
                    <Box className={classes.reverseWrapper}>
                        <Box className={classes.reverse}>
                            <ArrowDownward className={classes.reverseIcon} onClick={onSwitch} />
                        </Box>
                    </Box>
                    <Box className={classes.section} marginBottom={2.5}>
                        <Box className={classes.card}>
                            <Typography className={classes.title}>{t('plugin_trader_swap_receive')}</Typography>
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
                                    <Box marginTop="12px">
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
                <Box className={classes.stateBar}>
                    <PluginWalletStatusBar>
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
                                </EthereumERC20TokenApprovedBoundary>
                            </WalletConnectedBoundary>
                        </ChainBoundary>
                    </PluginWalletStatusBar>
                </Box>
            </>
        )
    },
)
