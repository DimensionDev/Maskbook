import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { noop } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { makeStyles, createStyles, Typography, Grid, IconButton, Tooltip } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import TuneIcon from '@material-ui/icons/Tune'
import RefreshOutlined from '@material-ui/icons/RefreshOutlined'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../../Wallet/messages'
import { ApproveState } from '../../../../web3/hooks/useERC20TokenApproveCallback'
import { TradeStrategy, TokenPanelType, TradeComputed, WarningLevel, TradeProvider } from '../../types'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useChainIdValid } from '../../../../web3/hooks/useChainState'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../../web3/types'
import { currentSlippageTolerance } from '../../settings'
import { PluginTraderMessages } from '../../messages'
import { toBips } from '../../helpers'
import { formatBalance, formatPercentage } from '../../../Wallet/formatter'
import { resolveUniswapWarningLevel } from '../../pipes'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { useTradeContext } from '../../trader/useTradeContext'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
            marginTop: theme.spacing(2),
            paddingTop: 12,
            paddingBottom: 12,
        },
        ethereumChainChip: {
            borderRadius: 8,
            marginRight: theme.spacing(1),
        },
        ethereumAccountChip: {
            borderRadius: 12,
        },
    })
})

export interface TradeFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    trade: TradeComputed | null
    strategy: TradeStrategy
    provider: TradeProvider
    loading: boolean
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed
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

    //#region context
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    //#endregion

    //#region approve token
    const { approveToken, approveAmount, approveAddress } = useTradeApproveComputed(trade, provider, inputToken)
    //#endregion

    //#region token balance
    const inputTokenBalanceAmount = new BigNumber(inputTokenBalance || '0')
    const outputTokenBalanceAmount = new BigNumber(outputTokenBalance || '0')
    //#endregion

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    //#region remote controlled swap settings dialog
    const [, setSwapSettingsDialogOpen] = useRemoteControlledDialog(PluginTraderMessages.events.swapSettingsUpdated)
    //#endregion

    //#region form controls
    const isExactIn = strategy === TradeStrategy.ExactIn
    const inputTokenTradeAmount = new BigNumber(inputAmount || '0').multipliedBy(
        new BigNumber(10).pow(inputToken?.decimals ?? 0),
    )
    const outputTokenTradeAmount = new BigNumber(outputAmount || '0').multipliedBy(
        new BigNumber(10).pow(outputToken?.decimals ?? 0),
    )
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
        if (!trade) return t('plugin_trader_error_insufficient_lp')
        if (inputTokenTradeAmount.isZero() && outputTokenTradeAmount.isZero())
            return t('plugin_trader_error_amount_absence')
        if (!inputToken || !outputToken) return t('plugin_trader_error_amount_absence')
        if (inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount))
            return t('plugin_trader_error_insufficient_balance', {
                symbol: inputToken?.symbol,
            })
        if (loading) return t('plugin_trader_finding_price')
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
                        Slippage Tolerance: {formatPercentage(toBips(currentSlippageTolerance.value))}
                    </Typography>
                    <IconButton className={classes.icon} size="small" onClick={onRefreshClick}>
                        <RefreshOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                        className={classes.icon}
                        size="small"
                        onClick={() => setSwapSettingsDialogOpen({ open: true })}>
                        <TuneIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>
            <div className={classes.section}>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        amount={approveAmount.toFixed()}
                        token={approveToken?.type === EthereumTokenType.ERC20 ? approveToken : undefined}
                        spender={approveAddress}>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading || !!validationMessage}
                            onClick={onSwap}>
                            {validationMessage || t('plugin_trader_swap')}
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </div>
        </div>
    )
}
