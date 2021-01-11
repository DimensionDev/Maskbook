import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { noop } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { makeStyles, createStyles, Typography, Grid, IconButton } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import TuneIcon from '@material-ui/icons/Tune'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../../Wallet/messages'
import { ApproveState } from '../../../../web3/hooks/useERC20TokenApproveCallback'
import { TradeStrategy, TokenPanelType, TradeComputed } from '../../types'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useChainIdValid } from '../../../../web3/hooks/useChainState'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { currentSlippageTolerance } from '../../settings'
import { PluginTraderMessages } from '../../messages'
import { toBips } from '../../helpers'
import { formatBalance, formatPercentage } from '../../../Wallet/formatter'
import { resolveUniswapWarningLevel } from '../../pipes'
import { WarningLevel } from '../../types/uniswap'

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
    approveState: ApproveState
    strategy: TradeStrategy
    trade: TradeComputed | null
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
    onTokenChipClick?: (token: TokenPanelType) => void
    onApprove: () => void
    onExactApprove: () => void
    onSwap: () => void
}

export function TradeForm(props: TradeFormProps) {
    const { t } = useI18N()
    const {
        approveState,
        trade,
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
        onTokenChipClick = noop,
        onApprove,
        onExactApprove,
        onSwap,
    } = props
    const classes = useStylesExtends(useStyles(), props)

    //#region context
    const account = useAccount()
    const chainIdValid = useChainIdValid()
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
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING

    // validate form return a message if an error exists
    const validationMessage = useMemo(() => {
        if (inputTokenTradeAmount.isZero() && outputTokenTradeAmount.isZero())
            return t('plugin_trader_error_amount_absence')
        if (!inputToken || !outputToken) return t('plugin_trader_error_amount_absence')
        if (inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount))
            return t('plugin_trader_error_insufficient_balance', {
                symbol: inputToken?.symbol,
            })
        if (loading) return t('plugin_trader_finding_price')
        if (!trade) return t('plugin_trader_error_insufficient_lp')
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
                    <Typography color="textSecondary" variant="body2">
                        Slippage Tolerance: {formatPercentage(toBips(currentSlippageTolerance.value))}
                    </Typography>
                    <IconButton size="small" onClick={() => setSwapSettingsDialogOpen({ open: true })}>
                        <TuneIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>
            <div className={classes.section}>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                    {approveRequired && !loading ? (
                        approveState === ApproveState.PENDING ? (
                            <Grid item xs={12}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={approveState === ApproveState.PENDING}>
                                    {`Unlocking ${inputToken?.symbol ?? 'Token'}…`}
                                </ActionButton>
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={6}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onExactApprove}>
                                        {approveState === ApproveState.NOT_APPROVED
                                            ? t('plugin_wallet_token_unlock', {
                                                  balance: formatBalance(
                                                      new BigNumber(inputTokenTradeAmount),
                                                      inputToken?.decimals ?? 0,
                                                      2,
                                                  ),
                                                  symbol: inputToken?.symbol ?? 'Token',
                                              })
                                            : ''}
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onApprove}>
                                        {approveState === ApproveState.NOT_APPROVED
                                            ? t('plugin_wallet_token_infinite_unlock')
                                            : ''}
                                    </ActionButton>
                                </Grid>
                            </>
                        )
                    ) : (
                        <Grid item xs={12}>
                            {!account || !chainIdValid ? (
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={onConnect}>
                                    {t('plugin_wallet_connect_a_wallet')}
                                </ActionButton>
                            ) : (
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading || !!validationMessage || approveRequired}
                                    onClick={onSwap}>
                                    {validationMessage || t('plugin_trader_swap')}
                                </ActionButton>
                            )}
                        </Grid>
                    )}
                </Grid>
            </div>
        </div>
    )
}
