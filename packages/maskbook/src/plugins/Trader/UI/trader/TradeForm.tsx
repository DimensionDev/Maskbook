import { useMemo } from 'react'
import classNames from 'classnames'
import { noop } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { IconButton, makeStyles, Typography } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import TuneIcon from '@material-ui/icons/Tune'
import RefreshOutlined from '@material-ui/icons/RefreshOutlined'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenPanelType, TradeComputed, TradeProvider, TradeStrategy, WarningLevel } from '../../types'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { EthereumTokenType, formatPercentage, FungibleTokenDetailed, isLessThan, pow10 } from '@masknet/web3-shared'
import { currentSlippageTolerance } from '../../settings'
import { PluginTraderMessages } from '../../messages'
import { isNativeTokenWrapper, toBips } from '../../helpers'
import { resolveUniswapWarningLevel } from '../../pipes'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { MINIMUM_AMOUNT } from '../../constants'

const useStyles = makeStyles((theme) => {
    return {
        form: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        section: {
            textAlign: 'center',
            margin: `${theme.spacing(1)}px auto`,
        },
        divider: {
            marginTop: theme.spacing(1.5),
            marginBottom: theme.spacing(1),
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
        reverseIcon: {
            cursor: 'pointer',
        },
        button: {
            marginTop: theme.spacing(1.5),
            paddingTop: 12,
            paddingBottom: 12,
        },
    }
})

export interface TradeFormProps extends withClasses<never> {
    trade: TradeComputed | null
    strategy: TradeStrategy
    provider: TradeProvider
    loading: boolean
    inputToken?: FungibleTokenDetailed
    outputToken?: FungibleTokenDetailed
    inputAmount: string
    outputAmount: string
    inputTokenBalance?: string
    outputTokenBalance?: string
    onInputAmountChange: (amount: string) => void
    onOutputAmountChange: (amount: string) => void
    onReverseClick?: () => void
    onRefreshClick?: () => void
    onTokenChipClick?: (token: TokenPanelType) => void
    onSwap: () => void
}

export function TradeForm(props: TradeFormProps) {
    const { t } = useI18N()
    const {
        trade,
        provider,
        loading,
        strategy,
        inputToken,
        outputToken,
        inputTokenBalance,
        outputTokenBalance,
        inputAmount,
        outputAmount,
        onInputAmountChange,
        onOutputAmountChange,
        onReverseClick = noop,
        onRefreshClick = noop,
        onTokenChipClick = noop,
        onSwap,
    } = props
    const classes = useStylesExtends(useStyles(), props)

    //#region approve token
    const { approveToken, approveAmount, approveAddress } = useTradeApproveComputed(trade, inputToken)
    //#endregion

    //#region token balance
    const inputTokenBalanceAmount = new BigNumber(inputTokenBalance || '0')
    const outputTokenBalanceAmount = new BigNumber(outputTokenBalance || '0')
    //#endregion

    //#region remote controlled swap settings dialog
    const { openDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapSettingsUpdated)
    //#endregion

    //#region form controls
    const isExactIn = strategy === TradeStrategy.ExactIn
    const inputTokenTradeAmount = new BigNumber(inputAmount || '0').multipliedBy(pow10(inputToken?.decimals ?? 0))
    const outputTokenTradeAmount = new BigNumber(outputAmount || '0').multipliedBy(pow10(outputToken?.decimals ?? 0))
    const inputPanelLabel =
        loading && !isExactIn
            ? t('plugin_trader_finding_price')
            : 'From' + (!isExactIn && inputTokenTradeAmount.isGreaterThan(0) ? ' (estimated)' : '')
    const outputPanelLabel =
        loading && isExactIn
            ? t('plugin_trader_finding_price')
            : 'To' + (isExactIn && outputTokenTradeAmount.isGreaterThan(0) ? ' (estimated)' : '')
    const sections = [
        {
            key: 'input',
            children: (
                <TokenAmountPanel
                    label={inputPanelLabel}
                    amount={inputAmount}
                    balance={inputTokenBalanceAmount.toFixed()}
                    token={inputToken}
                    onAmountChange={onInputAmountChange}
                    TextFieldProps={{
                        disabled: !inputToken,
                    }}
                    SelectTokenChip={{
                        ChipProps: {
                            onClick: () => onTokenChipClick(TokenPanelType.Input),
                        },
                    }}
                />
            ),
        },
        {
            key: 'divider',
            children: (
                <Typography color="primary">
                    <ArrowDownwardIcon className={classes.reverseIcon} onClick={onReverseClick} />
                </Typography>
            ),
        },
        {
            key: 'output',
            children: (
                <TokenAmountPanel
                    label={outputPanelLabel}
                    amount={outputAmount}
                    balance={outputTokenBalanceAmount.toFixed()}
                    token={outputToken}
                    onAmountChange={onOutputAmountChange}
                    MaxChipProps={{ style: { display: 'none' } }}
                    TextFieldProps={{
                        disabled: !outputToken,
                    }}
                    SelectTokenChip={{
                        ChipProps: {
                            onClick: () => onTokenChipClick(TokenPanelType.Output),
                        },
                    }}
                />
            ),
        },
    ] as {
        key: 'input' | 'output' | 'divider'
        children?: React.ReactNode
    }[]
    //#endregion

    //#region UI logic
    // validate form return a message if an error exists
    const validationMessage = useMemo(() => {
        if (inputTokenTradeAmount.isZero() && outputTokenTradeAmount.isZero())
            return t('plugin_trader_error_amount_absence')
        if (isLessThan(inputAmount, MINIMUM_AMOUNT)) return t('plugin_trade_error_input_amount_less_minimum_amount')
        if (isLessThan(outputAmount, MINIMUM_AMOUNT)) return t('plugin_trade_error_output_amount_less_minimum_amount')
        if (!inputToken || !outputToken) return t('plugin_trader_error_amount_absence')
        if (loading) return t('plugin_trader_finding_price')
        if (!trade) return t('plugin_trader_error_insufficient_lp')
        if (inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount))
            return t('plugin_trader_error_insufficient_balance', {
                symbol: inputToken?.symbol,
            })
        if (resolveUniswapWarningLevel(trade.priceImpact) === WarningLevel.BLOCKED)
            return t('plugin_trader_error_price_impact_too_high')
        return ''
    }, [
        loading,
        inputToken,
        outputToken,
        inputTokenBalanceAmount.toFixed(),
        inputTokenTradeAmount.toFixed(),
        outputTokenTradeAmount.toFixed(),
        trade?.priceImpact,
    ])
    //#endregion

    return (
        <div className={classes.form}>
            {sections.map(({ key, children }) => (
                <div className={classNames(classes.section, key === 'divider' ? classes.divider : '')} key={key}>
                    {children}
                </div>
            ))}
            <div className={classes.section}>
                <div className={classes.status}>
                    <Typography className={classes.label} color="textSecondary" variant="body2">
                        {t('plugin_trader_slipage_tolerance')}{' '}
                        {formatPercentage(toBips(currentSlippageTolerance.value))}
                    </Typography>
                    <IconButton className={classes.icon} size="small" onClick={onRefreshClick}>
                        <RefreshOutlined fontSize="small" />
                    </IconButton>
                    <IconButton className={classes.icon} size="small" onClick={openDialog}>
                        <TuneIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>
            <div className={classes.section}>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        amount={approveAmount.toFixed()}
                        token={
                            !isNativeTokenWrapper(trade) && approveToken?.type === EthereumTokenType.ERC20
                                ? approveToken
                                : undefined
                        }
                        spender={approveAddress}>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading || !!validationMessage}
                            onClick={onSwap}>
                            {validationMessage ||
                                (isNativeTokenWrapper(trade)
                                    ? trade?.trade_?.isWrap
                                        ? t('plugin_trader_wrap')
                                        : t('plugin_trader_unwrap')
                                    : t('plugin_trader_swap'))}
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </div>
        </div>
    )
}
