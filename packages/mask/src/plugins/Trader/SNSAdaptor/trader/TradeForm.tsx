import { memo, useMemo, useState } from 'react'
import { useI18N } from '../../../../utils'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { InputTokenPanel } from './InputTokenPanel'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { Box, chipClasses, Collapse, IconButton, Tooltip, Typography } from '@mui/material'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { EthereumTokenType, formatBalance, formatPercentage, isLessThan, pow10 } from '@masknet/web3-shared-evm'
import { TokenPanelType, TradeInfo, WarningLevel } from '../../types'
import BigNumber from 'bignumber.js'
import { first, noop } from 'lodash-es'
import { FormattedBalance, SelectTokenChip, useRemoteControlledDialog } from '@masknet/shared'
import { ChevronUpIcon } from '@masknet/icons'
import classnames from 'classnames'
import { TraderInfo } from './TraderInfo'
import { PluginTraderMessages } from '../../messages'
import { isNativeTokenWrapper, toBips } from '../../helpers'
import { currentSlippageSettings } from '../../settings'
import RefreshOutlined from '@mui/icons-material/RefreshOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import { MINIMUM_AMOUNT } from '../../constants'
import { resolveTradeProviderName, resolveUniswapWarningLevel } from '../../pipes'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { HelpOutline } from '@mui/icons-material'
import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { useUpdateEffect } from 'react-use'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        reverseIcon: {
            cursor: 'pointer',
        },
        card: {
            backgroundColor: MaskColorVar.twitterInputBackground,
            border: `1px solid ${MaskColorVar.twitterBorderLine}`,
            borderRadius: 12,
            padding: 12,
        },
        balance: {
            fontSize: 14,
            lineHeight: '20px',
            color: MaskColorVar.twitterButton,
        },
        amount: {
            color: MaskColorVar.twitterBlue,
            marginLeft: 10,
        },

        reverse: {
            backgroundColor: MaskColorVar.twitterInputBackground,
            width: 32,
            height: 32,
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0 16px 0',
            color: MaskColorVar.blue,
        },
        chevron: {
            fill: 'none',
            stroke: MaskColorVar.twitterMain,
            transition: 'all 300ms',
            cursor: 'pointer',
        },
        reverseChevron: {
            transform: `rotate(-180deg)`,
            transition: 'all 300ms',
        },
        status: {
            marginTop: theme.spacing(0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        button: {
            fontSize: 18,
            lineHeight: '22px',
            fontWeight: 600,
            padding: '13px 0',
            borderRadius: 24,
            height: 'auto',
        },
        disabledButton: {
            fontSize: 18,
            lineHeight: '22px',
            fontWeight: 600,
            padding: '13px 0',
            borderRadius: 24,
            height: 'auto',
        },
        selectedTokenChip: {
            borderRadius: `22px!important`,
            height: 'auto',
            backgroundColor: MaskColorVar.twitterInput,
            [`& .${chipClasses.label}`]: {
                paddingTop: 13,
                paddingBottom: 13,
                fontSize: 13,
                lineHeight: '18px',
            },
        },
        chipTokenIcon: {
            width: '36px!important',
            height: '36px!important',
        },
        controller: {
            width: '100%',
            backgroundColor: theme.palette.background.paper,
            position: 'sticky',
            bottom: 0,
        },
        noToken: {
            borderRadius: `18px !important`,
            backgroundColor: MaskColorVar.blue,
            '&:hover': {
                backgroundColor: MaskColorVar.blue.alpha(0.4),
            },
            [`& .${chipClasses.label}`]: {
                paddingTop: 9,
                paddingBottom: 9,
                fontSize: 13,
                lineHeight: '18px',
                color: MaskColorVar.white,
            },
        },
    }
})

export interface AllTradeFormProps {
    inputAmount: string
    inputToken?: FungibleTokenDetailed
    outputToken?: FungibleTokenDetailed
    inputTokenBalance?: string
    outputTokenBalance?: string
    onInputAmountChange: (amount: string) => void
    onTokenChipClick?: (token: TokenPanelType) => void
    onRefreshClick?: () => void
    trades: TradeInfo[]
    focusedTrade?: TradeInfo
    onFocusedTradeChange: (trade: TradeInfo) => void
    onSwap: () => void
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
        outputTokenBalance,
        onRefreshClick,
        focusedTrade,
        onFocusedTradeChange,
        onSwap,
    }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const { targetChainId: chainId } = TargetChainIdContext.useContainer()
        const [isExpand, setIsExpand] = useState(false)

        //#region approve token
        const { approveToken, approveAmount, approveAddress } = useTradeApproveComputed(
            focusedTrade?.value ?? null,
            focusedTrade?.provider,
            inputToken,
        )

        //#region token balance
        const inputTokenBalanceAmount = new BigNumber(inputTokenBalance || '0')
        //#endregion

        //#region get the best trade
        const bestTrade = useMemo(() => first(trades), [trades])
        //#endregion

        //#region remote controlled swap settings dialog
        const { openDialog: openSwapSettingDialog } = useRemoteControlledDialog(
            PluginTraderMessages.swapSettingsUpdated,
        )
        //#endregion

        //#region form controls
        const inputTokenTradeAmount = new BigNumber(inputAmount || '0').multipliedBy(pow10(inputToken?.decimals ?? 0))
        //#endregion

        //#region UI logic
        // validate form return a message if an error exists
        const validationMessage = useMemo(() => {
            if (inputTokenTradeAmount.isZero()) return t('plugin_trader_error_amount_absence')
            if (isLessThan(inputAmount, MINIMUM_AMOUNT)) return t('plugin_trade_error_input_amount_less_minimum_amount')
            if (!inputToken || !outputToken) return t('plugin_trader_error_amount_absence')
            if (!trades.length) return t('plugin_trader_error_insufficient_lp')
            if (inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount.plus(focusedTrade?.value?.fee ?? 0)))
                return t('plugin_trader_error_insufficient_balance', {
                    symbol: inputToken?.symbol,
                })
            if (
                focusedTrade?.value &&
                resolveUniswapWarningLevel(focusedTrade.value.priceImpact) === WarningLevel.BLOCKED
            )
                return t('plugin_trader_error_price_impact_too_high')

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
        //#endregion

        //#region native wrap message
        const nativeWrapMessage = useMemo(() => {
            if (focusedTrade?.value && isNativeTokenWrapper(focusedTrade.value)) {
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
        }, [focusedTrade, outputToken])
        //#endregion

        useUpdateEffect(() => {
            setIsExpand(false)
        }, [chainId, inputToken, inputAmount, outputToken])

        useUpdateEffect(() => {
            if (bestTrade && !focusedTrade) {
                onFocusedTradeChange(bestTrade)
            }
        }, [bestTrade, focusedTrade])

        return (
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
                        },
                    }}
                />
                <Box className={classes.reverse}>
                    <ArrowDownwardIcon className={classes.reverseIcon} />
                </Box>
                <Box className={classes.section}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        {outputToken && outputTokenBalance !== undefined ? (
                            <>
                                <Typography>{t('plugin_trader_swap_to')}</Typography>
                                <Typography className={classes.balance}>
                                    {t('plugin_ito_list_table_got')}:
                                    <Typography component="span" className={classes.amount}>
                                        <FormattedBalance
                                            value={outputTokenBalance}
                                            decimals={outputToken?.decimals}
                                            significant={6}
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
                            ChipProps={{ onClick: () => onTokenChipClick(TokenPanelType.Output) }}
                        />

                        <Box marginTop="10px">
                            {bestTrade ? (
                                <TraderInfo
                                    trade={bestTrade}
                                    onClick={() => onFocusedTradeChange(bestTrade)}
                                    isFocus={bestTrade.provider === focusedTrade?.provider}
                                    isBest
                                />
                            ) : null}
                            <Collapse in={isExpand}>
                                {trades.slice(1).map((trade) => (
                                    <TraderInfo
                                        key={trade.provider}
                                        trade={trade}
                                        onClick={() => onFocusedTradeChange(trade)}
                                        isFocus={trade.provider === focusedTrade?.provider}
                                    />
                                ))}
                            </Collapse>
                        </Box>
                        {trades.filter((item) => !!item.value).length > 1 ? (
                            <Box width="100%" display="flex" justifyContent="center" marginTop={2.5}>
                                <ChevronUpIcon
                                    className={classnames(classes.chevron, isExpand ? classes.reverseChevron : null)}
                                    onClick={() => setIsExpand(!isExpand)}
                                />
                            </Box>
                        ) : null}
                    </Box>
                </Box>
                <Box className={classes.controller}>
                    <Box className={classes.section} my={1}>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_trader_slippage_tolerance')}{' '}
                                {formatPercentage(toBips(currentSlippageSettings.value))}
                            </Typography>
                            <IconButton className={classes.icon} size="small" onClick={onRefreshClick}>
                                <RefreshOutlined fontSize="small" />
                            </IconButton>
                            <IconButton className={classes.icon} size="small" onClick={openSwapSettingDialog}>
                                <TuneIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </Box>
                    <Box className={classes.section}>
                        <EthereumChainBoundary
                            chainId={chainId}
                            noSwitchNetworkTip
                            noChainIcon={false}
                            disablePadding={true}
                            ChainIconProps={{ size: 24 }}
                            ActionButtonPromiseProps={{
                                fullWidth: true,
                                classes: { root: classes.button, disabled: classes.disabledButton },
                                color: 'primary',
                                style: { padding: '12px 0', marginTop: 0 },
                            }}>
                            <EthereumWalletConnectedBoundary
                                ActionButtonProps={{ color: 'primary', classes: { root: classes.button } }}>
                                <EthereumERC20TokenApprovedBoundary
                                    amount={approveAmount.toFixed()}
                                    token={
                                        !isNativeTokenWrapper(focusedTrade?.value ?? null) &&
                                        approveToken?.type === EthereumTokenType.ERC20 &&
                                        !!approveAmount.toNumber()
                                            ? approveToken
                                            : undefined
                                    }
                                    spender={approveAddress}
                                    onlyInfiniteUnlock
                                    withChildren
                                    ActionButtonProps={{
                                        color: 'primary',
                                    }}
                                    infiniteUnlockContent={
                                        <Box component="span" display="flex" alignItems="center">
                                            {t('plugin_trader_unlock_symbol', {
                                                symbol: approveToken?.symbol,
                                            })}
                                            <Tooltip
                                                PopperProps={{
                                                    disablePortal: true,
                                                }}
                                                title={t('plugin_trader_unlock_tips', {
                                                    provider: focusedTrade?.provider
                                                        ? resolveTradeProviderName(focusedTrade.provider)
                                                        : '',
                                                    symbol: approveToken?.symbol,
                                                })}
                                                arrow
                                                disableFocusListener
                                                disableTouchListener>
                                                <HelpOutline style={{ marginLeft: 10 }} />
                                            </Tooltip>
                                        </Box>
                                    }
                                    render={(disable: boolean) => (
                                        <ActionButton
                                            fullWidth
                                            variant="contained"
                                            disabled={
                                                focusedTrade?.loading ||
                                                !focusedTrade?.value ||
                                                !!validationMessage ||
                                                disable
                                            }
                                            classes={{ root: classes.button, disabled: classes.disabledButton }}
                                            color="primary"
                                            onClick={onSwap}>
                                            {validationMessage || nativeWrapMessage}
                                        </ActionButton>
                                    )}
                                />
                            </EthereumWalletConnectedBoundary>
                        </EthereumChainBoundary>
                    </Box>
                </Box>
            </Box>
        )
    },
)
